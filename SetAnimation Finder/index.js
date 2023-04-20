const pokemonTools = require("pokemonTools.js");
let pokemonData = {}
let selectedVariant;
let pokemon = 'Missingno_'

// Auto-update pokemon selection
document.getElementById('pokemonInput').addEventListener('input', () => {
    setTimeout(waitForNoInput, 500, document.getElementById('pokemonInput').value);
    async function waitForNoInput(item) {
        if (item !== document.getElementById('pokemonInput').value) return;
        const newPokemon = item === '' ? 'Missingno_' : pokemonTools.getClosestMatch(item);
        if (newPokemon !== pokemon) {
            document.getElementById('pokemonInputPredict').innerHTML = ` - ${newPokemon}`
            pokemonData = await window.electronAPI.getPokemonData(newPokemon)
            updateVariants()
        }
        pokemon = newPokemon
    }
})

document.getElementById('variantList').addEventListener('input', updateSelectedVariant)

// Initialize Table
document.getElementById('animationList').addEventListener('input', updateTable)

function updateVariants() {
    document.getElementById('variantList').innerHTML = pokemonData.forms.map(x => `<option value="${x.fullName}">${x.fullName}</option>`)
    updateSelectedVariant();
}

function updateSelectedVariant() {
    selectedVariant = pokemonData.forms.find(x => x.fullName == document.getElementById('variantList').value)
    updateTertiaryOption();
}

let animIndexes = []

// Dynamic dropdown
async function updateTertiaryOption() {
    const xmlJSON = await window.electronAPI.readXMLData(selectedVariant)
    animIndexes = []
    if (!xmlJSON) {
        document.getElementById('animationList').innerHTML = ''
        return;
    };
    let animList = []
    xmlJSON.AnimData.Anims[0].Anim.forEach(x => {
        animIndexes.push([x.Index?.[0] ? parseInt(x.Index?.[0]) : -1, x.Name[0]])
        animList.push(x.Name[0])
    })
    animList = animList.map(x => `<option value=${x}>${x}</option>`)
    document.getElementById('animationList').innerHTML = animList.join("\n")
    updateTable()
}

async function updateTable() {
    const anim = document.getElementById('animationList').value
    const filteredRef = await window.electronAPI.filterRef(animIndexes.find(x => x[1] == anim)[0])
    const finalMap = filteredRef.map(x => {
        let builder = `<tr>`
        builder += `<td>${x.setAnimation}</td>`
        const bools = ['freezes', 'loops', 'overrideSpeed']
        bools.forEach(bool => {
            builder += `<td>${x[bool] ? '✔️' : '❌'}</td>`
        })
        const speeds = ['slowID', 'mediumID', 'fastID', 'freezeID']
        speeds.forEach(speed => {
            builder += `<td>${x[speed] || ''}</td>`
        })
        const unks = ['unk1', 'unk2']
        unks.forEach(unk => {
            builder += `<td>${x[unk] ? '✔️' : '❌'}</td>`
        })

        return builder;
    })
    finalMap.unshift(`<tr>${['ID','Freezes?','Loops?','Change Speed?', 'Slow ID','Medium ID','Fast ID', 'Freeze ID','Unk1','Unk2'].reduce((a, b) => a + `<th>${b}</th>`, "")}</tr>`)
    document.getElementById('setAnimationTable').innerHTML = finalMap.join("")
}