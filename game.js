import chalk from "chalk";
import fs from "fs";
import readline from "readline-sync";
import data from "./map.json" with { type: "json" }; 


// GLOBAL VARIABLES
let missilesLeft;
let targetsToWin = 0;
let gameIndex;
let allTargetsCount = 0;
let armoredTargetCount = 0;
let mapRows = getRowsFromJson();

// CONSTANTS
const { width, height } = getMapDimension();
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
const firedMap = new Map();

// UTILITY FUNTIONS
// Get the value at the passed coordinates
function getCurrentTargetValue(row, column) {
    // row and column are 1-based from the UI
    const n = mapRows[row - 1][column - 1];
    return isNaN(n) ? 0 : n;
}

// Display grid in current state
function showGrid(endGame = false) {
    console.log(buildGrid(endGame));
}

// Return boolean for whether the coordinate has been fired at or not
function isFiredCoordinate(row, column) {
    return firedMap.has(`${row},${column}`);
}

// Read the file and get the map rows
function getRowsFromJson() {
    try {
        if(!gameIndex){
            gameIndex = Math.floor(Math.random() * data.length);
        }
        const mapValue = data[gameIndex].grid;
        
        missilesLeft = data[gameIndex].missile_allowance;
        return mapValue;
    }
    catch (e) {
        let error = chalk.white.bgRed.bold(e);
        console.error(error);
        process.exit();
    }
}

// Get the map dimeantions based on length of longest row and number of rows
function getMapDimension() {
    try {
        let colLength = 0;

        // USE MAX VALUE FOR ROWS AND COLUMNS SO EMPTY SPACES APPEAR
        // RATHER THAN LEAVING OUT POSITIONS ON THE GRID

        for (let row = 0; row < mapRows.length; row++) {
            const cells = mapRows[row];
            for (let col = 0; col < cells.length; col++) {
                const val = cells[col];
                if (!isNaN(val) && val > 0) {
                    targetsToWin += 1;
                    allTargetsCount += 1;

                    if (val > 1) {
                        armoredTargetCount += 1;
                    }
                }
            }
            let l = cells.length;
            if (l > colLength) {
                colLength = l;
            }
        }

        return {
            width: colLength + 2,
            height: mapRows.length + 2,
        }
    } catch (e) {
        let error = chalk.white.bgRed.bold(e);
        console.error(error);
        process.exit();
    }
}

// Build the grid UI
function buildGrid(endGame = false) {
    let board = '';
    for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
            let entry = '';

            if (column === width - 1) {
                // Draw right border
                entry = chalk.bgBlack(' '.padEnd(2, ' '));
            } else if (row === height - 1) {
                // Draw bottom border
                entry = chalk.white.bgBlack(' '.padEnd(3, ' '));
            } else if (row === 0) {
                if (column === 0) {
                    entry = chalk.white.bgBlack(' '.padEnd(3, ' '));
                } else {
                    // Draw top border with letters
                    entry = chalk.white.bgBlack(` ${LETTERS[column - 1].padEnd(2, ' ')}`);
                }
            } else {
                if (column === 0) {
                    // Draw left border with numbers
                    entry = chalk.bgBlack(row.toString().padEnd(3, ' '));
                }
                else {
                    // FILL IN AREA
                    entry = fillInFireArea(row, column, endGame);
                }
            }

            board += entry;
        }

        board += '\n';
    }
    return board;
}

// Build firing area
function fillInFireArea(row, column, endGame = false) {
    let key = `${row},${column}`;
    const unprocessedValue = getCurrentTargetValue(row, column);

    // Process cells that were not fired at
    if (!isFiredCoordinate(row, column)) {
        if (unprocessedValue > 0 && endGame) {
            return chalk.bgBlue(' -'.padEnd(3, ' '));
        }
        return chalk.bgWhite(' '.padEnd(3, ' '));
    }

    let firedEntry = firedMap.get(key);
    if (!firedEntry) {
        // defensive fallback
        return chalk.bgRed(' X'.padEnd(3, ' '));
    }

    if (firedEntry.type === 'miss') {
        return chalk.bgRed(' X'.padEnd(3, ' '));
    } else if (firedEntry.type === 'hit') {
        return chalk.bgGreen(' O'.padEnd(3, ' '));
    } else if (firedEntry.type === 'armored') {
        return chalk.bgYellow(' -'.padEnd(3, ' '));
    } else {
        return chalk.bgRed(' X'.padEnd(3, ' '));
    }
}


// PROCESSING FUNTIONS
function getAndValidateCoordinates() {
    // Get values of non-label rows and columns
    const maxLetterIndex = width - 2;
    const maxNumber = height - 2;

    while (true) {
        const userInput = readline.question('Enter fire coordinates (e.g. A5): ').trim();
        const match = userInput.match(/^([A-Za-z]+)(\d+)$/);

        // Show something if it doesn't match and move to the next iteration
        if (!match) {
            console.log("Who are you firing at?! Cause that is not on this map, try again.");
            continue;
        }

        /*
            'match' has multiple values in a set, ours has three because our regex has two groups
            Example: [ 'aa44', 'aa', '44', index: 0, input: 'aa44', groups: undefined ]
            The first part is the whole input which we don't need
            The second is the first group in our regex, which checks for letters (lower and uppercase)
            The third part is the second group of the regex which checks for digits
            So we can append the values we need from the match result and get the letter and number parts
        */
        const [, letterPart, numberPart] = match;

        const letter = letterPart.toUpperCase();
        const number = parseInt(numberPart);

        const colIndex = LETTERS.indexOf(letter);
        const isInvalidLetter = colIndex < 0 || colIndex > maxLetterIndex - 1;
        const isInvalidNumber = number < 1 || number > maxNumber;

        if (isInvalidLetter || isInvalidNumber) {
            console.log("Who are you firing at?! Cause that is not on this map, try again.");
            continue;
        }

        if (isDuplicateShot(number, colIndex + 1)) {
            continue;
        }

        return [number, colIndex + 1];
    }
}

// Returns boolean for whether the shot is a valid or invalid duplicate
// Valid duplicate: For armored targets and targets not fired at, will return false
// Invalid duplicate: For regular targets that have been fired at, will return true
function isDuplicateShot(row, column) {
    let isFired = isFiredCoordinate(row, column);
    let key = `${row},${column}`;

    if (isFired) {
        const currentShot = firedMap.get(key);

        if (currentShot.type == 'armored') {
            isFired = false;
        } else {
            console.log("Let's not waste military resources. Try firing somewhere else.")
        }
    }

    return isFired;
}

// Handles all shot logic from getting valid coordinates to handling
//  suplicate shots and updating the map of fired coordinates
function processShot() {
    const [row, column] = getAndValidateCoordinates();

    let currentTargetShot = getCurrentTargetValue(row, column);
    const key = `${row},${column}`;

    missilesLeft -= 1;
    if (currentTargetShot > 0) {
        const type = getHitType(row, column, currentTargetShot);
        firedMap.set(key, { type: type, before: currentTargetShot, after: getCurrentTargetValue(row, column) })
    } else {
        console.log(chalk.red('\nMISS!!!\n'));
        firedMap.set(key, { type: 'miss', before: 0, after: 0 });
    }
}

// Handles getting the type of a hit; can be hit or armored
// (which will require more hits)
function getHitType(row, column, currentTargetShot) {
    let type = 'hit';
    if (currentTargetShot === 1) {
        console.log(chalk.green('\nHIT!!!\n'));
        targetsToWin -= 1;
    } else {
        type = 'armored';
        if (!isFiredCoordinate(row, column)) {
            console.log(chalk.green('\nARMORED TARGET HIT!\n'));
        } else {
            console.log(chalk.green('\nANOTHER HIT!\n'));
        }
        console.log(`You need ${currentTargetShot - 1}  more shot${currentTargetShot - 1 === 1 ? '' : 's'} to sink this target\n`);
    }
    // Update row cell value
    mapRows[row - 1][column - 1] = currentTargetShot - 1;

    return type;
}

// Game data prompt and instruction, for the vibe
function startGame() {
    console.log(`
*************************************************************
                BATTLESHIP  *  JAVASCRIPT
*************************************************************
Congratulations! General Lee has selected ${chalk.blue('YOU')} to man our new,
state of the art missile launching system.

Our sources tell us that there are ${chalk.red(targetsToWin)} enemy targets approaching.
We have ${chalk.red(missilesLeft)} left in our inventory. Your job, should you wish to
accept it, is to sink ${chalk.red('ALL')} enemy targets before
we run out of missiles.
    `);

    const isAccepted = readline.keyInYNStrict('Will you accept this mission? ');

    if (isAccepted) {
        try {
            console.log('\nGreat! Welcome to the team.\nYou start immediately\n');
            setTimeout(() => {
                showGrid();
                playGame();
            }, 800);
        } catch (e) {
            console.log(chalk.bgRed(e));
            process.exit();
        }
    } else {
        console.log('\nHow utterly disappointing.\n');
        process.exit();
    }

}

// The actual game play functionality once the user agrees to play
function playGame() {
    while (missilesLeft > 0) {
        processShot();

        if (targetsToWin > 0) {
            showGrid();
            console.log(`Missiles Left: ${missilesLeft} `);
            console.log(`Targets Left:  ${targetsToWin} `);
        } else {
            console.log('YOU HIT ALL THE TARGETS! WINNER!!!!!!');
            break;
        }

        console.log(`
**********************************************
        `);
    }

    showGrid(true);
    if (targetsToWin > 0) {
        console.log('You ran out of missiles. GAME OVER!');
    }


    let targetsLeftDecoratedBox = chalk.bgBlue(' -'.padEnd(3, ' '));
    let missedShotsDecoratedBox = chalk.bgRed(' X'.padEnd(3, ' '));
    let targetsHitDecoratedBox = chalk.bgGreen(' O'.padEnd(3, ' '));
    let armoredTargetDecoratedBox = chalk.bgYellow(' -'.padEnd(3, ' '));

    console.log(`
Targets Hit      (${targetsHitDecoratedBox}): ${allTargetsCount - targetsToWin}
Targets Misfired (${missedShotsDecoratedBox}): ${firedMap.size - (allTargetsCount - targetsToWin)}
Targets Left     (${targetsLeftDecoratedBox}): ${targetsToWin}
Armored Targets  (${armoredTargetDecoratedBox}): ${armoredTargetCount}
        `)
        checkRestartStatus();
    
}

function checkRestartStatus () {
    const gameSelection = readline.keyInSelect(["Retry Mission", "New Mission"], "Wanna play again? I have a good feeling about you.", {cancel: "Give up"});
    
    if(gameSelection === -1){
        const leaveGame = readline.keyInYNStrict("Are you sure?");

        if(leaveGame){
            console.log('\nWell, at least you tried.');
            process.exit();
        } else{
            console.log("\nCan't make up mind... CHECK");
            checkRestartStatus();
        }

    } else if(gameSelection === 1){
       gameIndex = null;
    }

    startGame();
}

// Calling the function to start everything
startGame();

// If this was multiplayer, we could add stealing missiles
// Then its value on the map.txt would be -1, -2, etc