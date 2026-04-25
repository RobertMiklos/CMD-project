# CMD-project

## Simulace Vesmíru

### Žáci: *Nicolas Doktor, Robert Mikloš*

## Ukázkový scénář použití:
> worlds> help

_Konzole ti vypíše možnosti příkazů_

> clear, exit, names, closeOrbit, farOrbit

_Vybereš si třeba **closeOrbit**_

_Změní se ti prefix a přepneš se do subkonzole pro close orbit_

> world/closeOrbit>
>
> world/closeOrbit> add moon kozak

_Do konzole se vypíše co se stalo_

> Objekt kozak (typ: moon) přidán na closeOrbit

_Použiješ příkaz **names**, abys viděl jména objektů_

> world/closeOrbit> names

_Dále se přepneš do toho konkrétního objektu_

> world/closeOrbit> kozak

_Nastavíš mu barvu a rychlost_

> world/closeOrbit/kozak > color blue
>
> world/closeOrbit/kozak > speed 3


" Říká se, že když jeden objekt na dráze zrychlíte a měl by se střetnout s dalším objektem, tak zázračně projdou. Ale v dávných mýtech se také říkalo, že je tu i šance, 1 ku 5 že neprojdou. Co se ale stane, nikdo neví. "

---
## Seznam příkazů
> world> help

> world> clear

> world> exit

> world> names

> world> closeOrbit

> world> farOrbit

> !

> world/closeOrbit> add ( typ ) ( jméno )

> world/closeOrbit> remove ( jméno )

> world/closeOrbit> back

> !

> world/closeOrbit/kozak> speed ( hodnota )

> world/closeOrbit/kozak> color ( barva )

---
## Funkční požadavky:
textová konzole (CLI),  
příkazy zadávané uživatelem,  
textová odezva systému,  
minimálně jeden řízený objekt,  
možnost dotazovat se na stav objektu,  
možnost měnit stav objektu  

## Technologie:
Javascript  
HTML  
CSS  
Markdown  

### Obrázky:
Dřívější verze
![Dřívější verze](/images/SCR/image.png)

Nejnovější verze
![Nejnovější verze](/images/SCR/stock.png)

Ukázkový scénář
![Ukázkový scénář](/images/SCR/priklad.png)