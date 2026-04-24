const input = document.getElementById("cli-input");
const promptText = document.getElementById("prompt-text");
const outputShell = document.getElementById("outputShell");
const cliForm = document.getElementById("cli-form");

let currentPath = [];

// Available object types
const availableTypes = ['moon', 'station'];

// State tracking - objects stored as { type: string, name: string }
const state = {
    orbit1: { objects: [] },
    orbit2: { objects: [] }
};

// Start with greeting
printToConsole("Dostupné příkazy: help, clear, orbit1, orbit2", false);

cliForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const commandLine = input.value.trim();
    if (commandLine) {
        printToConsole(commandLine, true);
        processCommand(commandLine);
    }
    input.value = "";
    // Keep focus
    input.focus();
});

function printToConsole(text, isCommand = false) {
    const p = document.createElement("p");
    if (isCommand) {
        p.innerHTML = `<span style="color: #4CAF50;">${getPromptString()}</span> ${text}`;
    } else {
        p.textContent = text;
        if (text.startsWith("Neznámý") || text.startsWith("Chyba:")) {
            p.style.color = "#ff4d4d"; // Red color for errors
        } else if (text.startsWith("Dostupné příkazy:")) {
            p.style.color = "#add8e6"; // Light blue color for available commands
        }
    }
    outputShell.appendChild(p);
    outputShell.scrollTop = outputShell.scrollHeight;
}

function getPromptString() {
    return currentPath.length === 0 ? "world>" : `world/${currentPath.join('/')}>`;
}

function updatePrompt() {
    promptText.textContent = getPromptString() + " ";
}

// Create a new DOM element for the given object type (wrapper > positioner > inner)
function createObjectElement(type, customName, orbitName) {
    // Wrapper rotates independently at orbit center
    const wrapper = document.createElement('div');
    wrapper.classList.add('object-wrapper');
    wrapper.dataset.objectName = customName;
    wrapper.dataset.objectType = type;

    // Default orbit duration
    const defaultDuration = orbitName === 'orbit1' ? 70 : 120;
    wrapper.style.animationDuration = `${defaultDuration}s`;

    // Positioner translates object to orbit edge
    const positioner = document.createElement('div');
    positioner.classList.add('object-positioner');

    // Inner element (the actual visible object)
    const inner = document.createElement('div');
    inner.classList.add(type);

    positioner.appendChild(inner);
    wrapper.appendChild(positioner);
    return wrapper;
}

// Find a wrapper DOM element by its custom name
function findObjectElement(customName) {
    return document.querySelector(`[data-object-name="${customName}"]`);
}

// Find an object in state by custom name (across all orbits)
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

// Redistribute all objects evenly around the orbit using animation-delay
function redistributeObjects(orbitName) {
    const objects = state[orbitName].objects;
    const count = objects.length;

    objects.forEach((obj, index) => {
        const wrapper = findObjectElement(obj.name);
        if (!wrapper) return;

        // Each wrapper may have a different duration (speed)
        const duration = parseFloat(wrapper.style.animationDuration) ||
                         (orbitName === 'orbit1' ? 70 : 120);

        // Negative delay offsets starting position evenly
        const delay = -(duration * index / count);
        wrapper.style.animationDelay = `${delay}s`;
    });
}

function processCommand(commandLine) {
    const args = commandLine.split(" ").filter(Boolean);
    const cmd = args[0].toLowerCase();

    // Global commands
    if (cmd === 'clear') {
        outputShell.innerHTML = "";
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

    // Context switching & handling
    if (currentPath.length === 0) {
        // In "world>"
        if (cmd === 'help') {
            printToConsole("Dostupné příkazy: help, clear, orbit1, orbit2");
        } else if (cmd === 'orbit1' || cmd === 'orbit2') {
            currentPath.push(cmd);
            updatePrompt();
        } else {
            printToConsole(`Neznámý příkaz: ${cmd}`);
        }
    } else if (currentPath.length === 1) {
        // In "world/orbitX>"
        const currentOrbit = currentPath[0];
        
        if (cmd === 'help') {
            const objNames = state[currentOrbit].objects.map(o => `${o.name} (${o.type})`).join(", ");
            printToConsole(`Dostupné příkazy: help, clear, add <typ> <název>, remove <název>, back`);
            printToConsole(`Dostupné typy: moon, station`);
            if (objNames) {
                printToConsole(`Objekty na orbitě: ${objNames} (napište název pro výběr)`);
            }
        } else if (cmd === 'add') {
            const objType = args[1];
            const customName = args[2];

            if (!objType || !customName) {
                printToConsole("Chyba: Použití: add <typ> <název>  (např. add moon Luna1)");
                return;
            }
            if (!availableTypes.includes(objType)) {
                printToConsole(`Chyba: Neznámý typ '${objType}'. Dostupné: moon, station.`);
                return;
            }
            // Check if custom name is already used anywhere
            if (findObjectInState(customName)) {
                printToConsole(`Chyba: Objekt s názvem '${customName}' již existuje.`);
                return;
            }

            // Add to current orbit state
            state[currentOrbit].objects.push({ type: objType, name: customName });

            // Create and append DOM element
            const el = createObjectElement(objType, customName, currentOrbit);
            const orbitEl = getOrbitElement(currentOrbit);
            if (orbitEl) {
                orbitEl.appendChild(el);
                // Set positioner to translate object to orbit edge
                const radius = orbitEl.offsetWidth / 2;
                const positioner = el.querySelector('.object-positioner');
                positioner.style.transform = `translateY(-${radius}px)`;
                redistributeObjects(currentOrbit);
                printToConsole(`Objekt '${customName}' (typ: ${objType}) přidán na ${currentOrbit}.`);
            }
        } else if (cmd === 'remove') {
            const customName = args[1];
            if (!customName) {
                printToConsole("Chyba: Zadejte název objektu k odstranění.");
                return;
            }
            const objIndex = state[currentOrbit].objects.findIndex(o => o.name.toLowerCase() === customName.toLowerCase());
            if (objIndex !== -1) {
                state[currentOrbit].objects.splice(objIndex, 1);
                const el = findObjectElement(customName);
                if (el) {
                    el.remove();
                }
                redistributeObjects(currentOrbit);
                printToConsole(`Objekt '${customName}' odstraněn.`);
            } else {
                printToConsole(`Chyba: Objekt '${customName}' nebyl na této orbitě nalezen.`);
            }
        } else {
            // Check if user typed a custom name to select an object
            const obj = state[currentOrbit].objects.find(o => o.name.toLowerCase() === cmd);
            if (obj) {
                currentPath.push(obj.name);
                updatePrompt();
            } else {
                printToConsole(`Neznámý příkaz nebo objekt neexistuje: ${cmd}`);
            }
        }
    } else if (currentPath.length === 2) {
        // In "world/orbitX/objectName>"
        const currentOrbit = currentPath[0];
        const currentObjectName = currentPath[1];
        const currentObj = state[currentOrbit].objects.find(o => o.name === currentObjectName);
        
        if (!currentObj) {
            printToConsole("Chyba: Objekt již neexistuje. Použijte 'back'.");
            return;
        }

        if (cmd === 'help') {
            let cmds = `Dostupné příkazy: help, clear, speed <číslo>, back`;
            if (currentObj.type === 'moon') {
                cmds += `, color <barva>`;
            }
            printToConsole(cmds);
        } else if (cmd === 'speed') {
            const speedVal = parseFloat(args[1]);
            if (isNaN(speedVal) || speedVal <= 0) {
                printToConsole("Chyba: Zadejte platné číslo větší než 0 pro rychlost.");
                return;
            }
            
            // Apply speed to this specific object's wrapper
            const wrapper = findObjectElement(currentObjectName);
            if (wrapper) {
                const defaultDuration = currentOrbit === 'orbit1' ? 70 : 120;
                const newDuration = defaultDuration / speedVal;
                wrapper.style.animationDuration = `${newDuration}s`;
                redistributeObjects(currentOrbit);
                printToConsole(`Rychlost objektu '${currentObjectName}' nastavena na ${speedVal}x (${newDuration.toFixed(2)}s).`);
            }
        } else if (cmd === 'color' && currentObj.type === 'moon') {
            const colorVal = args[1];
            if (!colorVal) {
                printToConsole("Chyba: Zadejte barvu (např. red, blue, #ff0000).");
                return;
            }
            const wrapper = findObjectElement(currentObjectName);
            if (wrapper) {
                const inner = wrapper.querySelector('.moon');
                if (inner) {
                    inner.style.background = `radial-gradient(circle at 35% 35%, ${colorVal}, #5a5a5a)`;
                    printToConsole(`Barva objektu '${currentObjectName}' byla změněna na '${colorVal}'.`);
                }
            }
        } else {
            printToConsole(`Neznámý příkaz: ${cmd}`);
        }
    }
}