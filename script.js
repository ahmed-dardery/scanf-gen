function initialize() {
    const button = document.getElementById('gen');
    button.addEventListener("click", generateOutput);
}

function generateOutput() {
    document.getElementById("output").innerHTML = attemptToGenerate();
}

const letter = ['i', 'j', 'k', 'ii', 'jj'];
const MAX_SCOPES = 5;

function attemptToGenerate() {
    //Write given data with respect to a particular scope
    const write = (scopes, append) => '    '.repeat(scopes) + append;

    //Generates a scanf statement that reads into corresponding arrays accessed by given indices.
    const scanf = (variables, indices) => {
        const accessor = indices.map(v => `[${v}]`).join("");
        let sb = [];

        const formattedVariables = variables.filter(v => v.length > 0).map(v => {
            const lastChar = v[v.length - 1];
            if (lastChar === "'")
                return `&${v.substring(0, v.length - 1)}`;
            else
                return `&${v}${accessor}`
        });

        sb.push(
            "scanf(\"",
            "%d".repeat(formattedVariables.length),
            "\", ",
            formattedVariables.join(", "),
            ");"
        );

        return sb.join("");
    };

    //Generates a loop statement with given info.
    const loop = (i, n) => `for (int ${i} = 0; ${i} < ${n}; ++${i})`;

    /*----------------------------------------------------------------------------------------*/

    const text = document.getElementById("input").value;
    const lines = text.split(/\n|\r\n/);
    let scopes = 0;
    let generatedLines = [];
    let allVariables = [];

    lines.forEach(line => {
        const symb = line.split(' ');
        if (symb.length === 0) return;
        let indices = [];
        let variables = [];

        const printCurrentVariables = () => {
            if (variables.length !== 0) {
                generatedLines.push(write(scopes, scanf(variables, indices)));
                allVariables = [...allVariables, ...variables];
                variables = [];
            }
        };

        let endlTerminators = 0;
        symb.forEach((symbol => {
            if (symbol === '}') {
                if (scopes > 0) {
                    printCurrentVariables();
                    generatedLines.push(write(--scopes, "}"));
                }
                else
                    generatedLines.push(write(scopes, "/* Unaccounted ^ was found */"));
                return;
            }
            const lastChar = symbol[symbol.length - 1];

            switch (lastChar) {
                //loop control
                case ':':
                case '{': {
                    printCurrentVariables();
                    const loopLimit = symbol.substring(0, symbol.length - 1);
                    if (loopLimit.length === 0)
                        return "Expected loop variable, found null.";

                    const iterator = lastChar === ':' ? letter[scopes] : loopLimit + loopLimit;

                    generatedLines.push(write(scopes++, loop(iterator, loopLimit) + '{'));

                    if (lastChar === ':') {
                        indices.push(iterator);
                        endlTerminators++;
                    }
                    break;
                }
                //normal scanf
                default: {
                    variables.push(symbol);
                    break;
                }
            }
        }));
        printCurrentVariables();

        while (endlTerminators > 0) {
            generatedLines.push(write(--scopes, "}"));
            --endlTerminators;
        }
    });
    while (scopes > 0) {
        generatedLines.push(write(--scopes, "}"));
    }
    //const declaration = `int ${allVariables.join(", ")};`;
    //return [declaration, '', ...generatedLines].join("\n");
    return generatedLines.join('\n');
}

////UI Functions 

function copy() {
    /* Get the text field */
    var copyText = document.getElementById("output");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/

    /* Copy the text inside the text field */
    document.execCommand("copy");

    /* Alert the copied text */

    document.getElementById("copy").focus();

}

$(document).ready(function () {
    $('[data-toggle="popover"]').popover();
});

