const input = document.getElementById("cli-input");
const promptText = document.getElementById("prompt-text");
const outputShell = document.getElementById("outputShell");
const cliForm = document.getElementById("cli-form");
let currentPath = [];
const availableTypes = ['moon', 'station'];
const state = {
    orbit1: { objects: [] },
    orbit2: { objects: [] }
};

processCommand("help");

cliForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const commandLine = input.value.trim();
    if (commandLine) {
        printToConsole(commandLine, true);
        processCommand(commandLine);
    }
    input.value = "";
    input.focus();
});

function printToConsole(text, isCommand = false) {
    const p = document.createElement("p");
    if (isCommand) {
        p.innerHTML = `<span style="color: #add8e6;">${getPromptString()}</span> ${text}`;
    } else {
        p.textContent = text;
        if (text.startsWith("Neznámý") || text.startsWith("Chyba:")) {
            p.style.color = "#ff4d4d";
        } else if (text.startsWith("Dostupné příkazy:")) {
            p.style.color = "#add8e6";
        }
    }
    outputShell.appendChild(p);
    outputShell.scrollTop = outputShell.scrollHeight;
}

function printError(msg) {
    printToConsole(`Chyba: ${msg}`);
}

function getPromptString() {
    return currentPath.length === 0 ? "world>" : `world/${currentPath.join('/')}>`;
}

function updatePrompt() {
    promptText.textContent = getPromptString() + " ";
}

function createObjectElement(type, customName, orbitName) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('object-wrapper');
    wrapper.dataset.objectName = customName;
    wrapper.dataset.objectType = type;
    const defaultDuration = orbitName === 'orbit1' ? 70 : 120;
    wrapper.style.animationDuration = `${defaultDuration}s`;
    const positioner = document.createElement('div');
    positioner.classList.add('object-positioner');
    const inner = document.createElement('div');
    inner.classList.add(type);
    
    const label = document.createElement('div');
    label.classList.add('object-label');
    label.style.animationDuration = `${defaultDuration}s`;
    label.innerHTML = `<div class="label-line"></div><div class="label-text">${customName}</div>`;
    
    positioner.appendChild(inner);
    positioner.appendChild(label);
    wrapper.appendChild(positioner);
    return wrapper;
}

function findObjectElement(customName) {
    return document.querySelector(`[data-object-name="${customName}"]`);
}

function findObjectInState(customName) {
    for (let orbit in state) {
        const obj = state[orbit].objects.find(o => o.name === customName);
        if (obj) return { obj, orbit };
    }
    return null;
}

function getOrbitElement(name) {
    return document.getElementById(name);
}

function redistributeObjects(orbitName) {
    const objects = state[orbitName].objects;
    const count = objects.length;
    const baseDuration = orbitName === 'orbit1' ? 70 : 120;
    objects.forEach((obj, index) => {
        const wrapper = findObjectElement(obj.name);
        if (!wrapper) return;
        const duration = baseDuration / obj.speed;
        wrapper.style.animationDuration = `${duration}s`;
        
        const label = wrapper.querySelector('.object-label');
        if (label) {
            label.style.animationDuration = `${duration}s`;
        }
        
        const delay = -(duration * index / count);
        wrapper.style.animationDelay = `${delay}s`;
        if (label) {
            label.style.animationDelay = `${delay}s`;
        }
    });
}

function processCommand(commandLine) {
    const args = commandLine.split(" ").filter(Boolean);
    if (!args.length) return;
    const cmd = args[0].toLowerCase();

    if (cmd === 'clear') {
        outputShell.innerHTML = "";
        processCommand("help");
        return;
    }
    if (cmd === 'exit') {
        currentPath = [];
        updatePrompt();
        processCommand('clear');
        return;
    }
    if (cmd === 'back') {
        if (currentPath.length > 0) {
            currentPath.pop();
            updatePrompt();
        } else {
            printToConsole("Již jste v kořenovém adresáři.");
        }
        return;
    }
    if (cmd === 'names') {
        document.body.classList.toggle('show-names');
        const isOn = document.body.classList.contains('show-names');
        printToConsole(`Zobrazování jmen (ukazatelů): ${isOn ? 'ZAPNUTO' : 'VYPNUTO'}.`);
        return;
    }

    const depth = currentPath.length;
    if (depth === 0) handleRootCommand(cmd);
    else if (depth === 1) handleOrbitCommand(cmd, args, currentPath[0]);
    else if (depth === 2) handleObjectCommand(cmd, args, currentPath[0], currentPath[1]);
}

function handleRootCommand(cmd) {
    if (cmd === 'help') {
        printToConsole("Dostupné příkazy: help, clear, exit, names, orbit1, orbit2");
    } else if (cmd === 'orbit1' || cmd === 'orbit2') {
        currentPath.push(cmd);
        updatePrompt();
    } else {
        printToConsole(`Neznámý příkaz: ${cmd}`);
    }
}

function handleOrbitCommand(cmd, args, currentOrbit) {
    if (cmd === 'help') {
        const objNames = state[currentOrbit].objects.map(o => `${o.name} (${o.type})`).join(", ");
        printToConsole(`Dostupné příkazy: help, clear, exit, names, add <typ> <název>, remove <název>, back`);
        printToConsole(`Dostupné typy: moon, station`);
        if (objNames) printToConsole(`Objekty na orbitě: ${objNames} (napište název pro výběr)`);
        return;
    }
    
    if (cmd === 'add') {
        const [, objType, customName] = args;
        if (!objType || !customName) return printError("Použití: add <typ> <název>  (např. add moon Luna1)");
        if (!availableTypes.includes(objType)) return printError(`Neznámý typ '${objType}'. Dostupné: moon, station.`);
        if (findObjectInState(customName)) return printError(`Objekt s názvem '${customName}' již existuje.`);

        const speed = Math.round((Math.random() * 0.9 + 0.1) * 100) / 100;
        state[currentOrbit].objects.push({ type: objType, name: customName, speed });
        
        const el = createObjectElement(objType, customName, currentOrbit);
        const orbitEl = getOrbitElement(currentOrbit);
        if (orbitEl) {
            orbitEl.appendChild(el);
            const radius = orbitEl.offsetWidth / 2;
            el.querySelector('.object-positioner').style.transform = `translateY(-${radius}px)`;
            redistributeObjects(currentOrbit);
            printToConsole(`Objekt '${customName}' (typ: ${objType}) přidán na ${currentOrbit}.`);
        }
        return;
    }
    
    if (cmd === 'remove') {
        const customName = args[1];
        if (!customName) return printError("Zadejte název objektu k odstranění.");
        
        const objects = state[currentOrbit].objects;
        const objIndex = objects.findIndex(o => o.name.toLowerCase() === customName.toLowerCase());
        
        if (objIndex !== -1) {
            objects.splice(objIndex, 1);
            findObjectElement(customName)?.remove();
            redistributeObjects(currentOrbit);
            printToConsole(`Objekt '${customName}' odstraněn.`);
        } else {
            printError(`Objekt '${customName}' nebyl na této orbitě nalezen.`);
        }
        return;
    }
    
    const obj = state[currentOrbit].objects.find(o => o.name.toLowerCase() === cmd);
    if (obj) {
        currentPath.push(obj.name);
        updatePrompt();
    } else {
        printToConsole(`Neznámý příkaz nebo objekt neexistuje: ${cmd}`);
    }
}

function handleObjectCommand(cmd, args, currentOrbit, currentObjectName) {
    const currentObj = state[currentOrbit].objects.find(o => o.name === currentObjectName);
    if (!currentObj) return printError("Objekt již neexistuje. Použijte 'back'.");

    if (cmd === 'help') {
        let cmds = `Dostupné příkazy: help, clear, exit, names, speed <číslo>, back`;
        if (currentObj.type === 'moon') cmds += `, color <barva>`;
        printToConsole(cmds);
        return;
    }
    
    if (cmd === 'speed') {
        const speedVal = parseFloat(args[1]);
        if (isNaN(speedVal) || speedVal <= 0) return printError("Zadejte platné číslo větší než 0 pro rychlost.");
        
        currentObj.speed = speedVal;
        redistributeObjects(currentOrbit);
        const defaultDuration = currentOrbit === 'orbit1' ? 70 : 120;
        printToConsole(`Rychlost objektu '${currentObjectName}' nastavena na ${speedVal}x (${(defaultDuration / speedVal).toFixed(2)}s).`);
        return;
    }
    
    if (cmd === 'color' && currentObj.type === 'moon') {
        const colorVal = args[1];
        if (!colorVal) return printError("Zadejte barvu (např. red, blue, #ff0000).");
        
        const inner = findObjectElement(currentObjectName)?.querySelector('.moon');
        if (inner) {
            inner.style.background = `radial-gradient(circle at 35% 35%, ${colorVal}, #5a5a5a)`;
            printToConsole(`Barva objektu '${currentObjectName}' byla změněna na '${colorVal}'.`);
        }
        return;
    }
    
    printToConsole(`Neznámý příkaz: ${cmd}`);
}

const collidingPairs = new Set();

function getAngleFromMatrix(matrixStr) {
    if (!matrixStr || matrixStr === 'none') return 0;
    const values = matrixStr.split('(')[1].split(')')[0].split(',');
    const a = parseFloat(values[0]);
    const b = parseFloat(values[1]);
    return Math.atan2(b, a);
}

function checkCollisions() {
    for (const orbitName in state) {
        const objects = state[orbitName].objects;
        for (let i = 0; i < objects.length; i++) {
            for (let j = i + 1; j < objects.length; j++) {
                const obj1 = objects[i];
                const obj2 = objects[j];
                const el1 = findObjectElement(obj1.name);
                const el2 = findObjectElement(obj2.name);
                if (!el1 || !el2) continue;

                const angle1 = getAngleFromMatrix(window.getComputedStyle(el1).transform);
                const angle2 = getAngleFromMatrix(window.getComputedStyle(el2).transform);

                let diff = Math.abs(angle1 - angle2);
                diff = Math.min(diff, 2 * Math.PI - diff);

                const pairId = `${orbitName}-${obj1.name}-${obj2.name}`;
                
                if (diff < 0.15) {
                    if (!collidingPairs.has(pairId)) {
                        collidingPairs.add(pairId);
                        
                        if (Math.random() < 0.2) {
                            createExplosion(el1);
                            
                            removeObjectQuietly(orbitName, obj1.name);
                            removeObjectQuietly(orbitName, obj2.name);
                            collidingPairs.delete(pairId);
                            
                            printToConsole(`POZOR: Objekty '${obj1.name}' a '${obj2.name}' se srazily a zničily!`);
                            
                            i--;
                            break;
                        }
                    }
                } else {
                    if (collidingPairs.has(pairId)) {
                        collidingPairs.delete(pairId);
                    }
                }
            }
        }
    }
    requestAnimationFrame(checkCollisions);
}

function createExplosion(referenceWrapper) {
    const inner = referenceWrapper.querySelector('.object-positioner').firstElementChild;
    const rect = inner.getBoundingClientRect();
    
    const explosion = document.createElement('div');
    explosion.style.position = 'fixed';
    explosion.style.left = `${rect.left + rect.width / 2}px`;
    explosion.style.top = `${rect.top + rect.height / 2}px`;
    explosion.style.width = '6em';
    explosion.style.height = '6em';
    explosion.style.transform = 'translate(-50%, -50%)';
    explosion.style.backgroundImage = 'url(../../images/explosion.png)';
    explosion.style.backgroundSize = 'contain';
    explosion.style.backgroundRepeat = 'no-repeat';
    explosion.style.backgroundPosition = 'center';
    explosion.style.zIndex = '1000';
    explosion.style.pointerEvents = 'none';
    
    document.body.appendChild(explosion);
    
    explosion.animate([
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        { opacity: 0, transform: 'translate(-50%, -50%) scale(1.5)' }
    ], {
        duration: 1500,
        easing: 'ease-out'
    });
    
    setTimeout(() => {
        explosion.remove();
    }, 1500);
}

function removeObjectQuietly(orbitName, customName) {
    const objects = state[orbitName].objects;
    const objIndex = objects.findIndex(o => o.name === customName);
    if (objIndex !== -1) {
        objects.splice(objIndex, 1);
        findObjectElement(customName)?.remove();
        redistributeObjects(orbitName);
    }
    if (currentPath.length === 2 && currentPath[0] === orbitName && currentPath[1] === customName) {
        currentPath.pop();
        updatePrompt();
    }
}

requestAnimationFrame(checkCollisions);
