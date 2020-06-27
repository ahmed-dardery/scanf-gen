function initialize() {
    const button = document.getElementById('gen');
    button.addEventListener("click", generateOutput);
}

function generateOutput() {
    const generated = attemptToGenerate();
    document.getElementById("output").innerHTML = generated;
}

const letter = ['i', 'j', 'k', 'ii', 'jj'];
const MAX_SCOPES = 5;

function attemptToGenerate() {
    const write = (scopes, append) => '    '.repeat(scopes) + append;
    const scanf = (variables, indicies) => {
        const accessor = indicies.map(v => `[${v}]`).join("");
        let sb = [];
        sb.push(
            "scanf(\"",
            "%d".repeat(variables.length),
            "\", ",
            variables.map(v => `&${v}${accessor}`).join(", "),
            ");"
        );

        return sb.join("");
    };
    const loop = (i, n) => `for (int ${i} = 0; ${i} < ${n}; ++${i})`;


    const text = document.getElementById("input").value;
    const lines = text.split(/\n|\r\n/);
    let scopes = 0;
    let generatedLines = [];
    let outsideScope = scopes;
    lines.forEach(line => {
        const symb = line.split(' ');
        if (symb.length === 0) return;
        let indicies = [];
        let variables = [];

        symb.forEach((symbol => {
            const lastChar = symbol[symbol.length - 1];
            let loopLimit = '';
            switch (lastChar) {
                case ':':
                case '^': {
                    if (variables.length > outsideScope) {
                        generatedLines.push(write(scopes, scanf(variables, indicies)));

                        variables = [];
                    }
                    loopLimit = symbol.substring(0, symbol.length - 1);
                    if (loopLimit.length === 0)
                        return "Expected loop variable, found null.";
                    break;
                }
                default: {
                    variables.push(symbol);
                    break;
                }
            }
            switch (lastChar) {
                case ':': {
                    if (indicies.length >= MAX_SCOPES)
                        return "Too many inner loops.";

                    const literal = letter[indicies.length];

                    generatedLines.push(write(scopes++, loop(literal, loopLimit) + '{'));
                    indicies.push(literal);
                    break;
                }
                case '^': {
                    generatedLines.push(write(scopes++, loop(loopLimit + loopLimit, loopLimit) + '{'));
                    outsideScope++;
                }
            }
        }));
        if (variables.length > 0) {
            generatedLines.push(write(scopes, scanf(variables, indicies)));
            variables = [];
        }
        while (scopes > outsideScope) {
            generatedLines.push(write(--scopes, "}"));
        }
    });
    generatedLines.push("");
    while (scopes > 0) {
        generatedLines.push(write(--scopes, "}"));
    }
    return generatedLines.join("\n");
}

