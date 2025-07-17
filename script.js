document.addEventListener('DOMContentLoaded', () => {
    const sqlInput = document.getElementById('sqlInput');
    const parseBtn = document.getElementById('parse');
    const clearBtn = document.getElementById('clear');
    const editorSection = document.getElementById('editorSection');
    const outputSection = document.getElementById('outputSection');
    const dataTableBody = document.querySelector('#dataTable tbody');
    const addRowBtn = document.getElementById('addRow');
    const generateBtn = document.getElementById('generate');
    const outputSQL = document.getElementById('outputSQL');
    const copyBtn = document.getElementById('copy');
    const themeToggle = document.getElementById('theme-toggle');

    let tableName = '';
    let columns = [];

    // --- Theme Switcher ---
    themeToggle.addEventListener('change', () => {
        document.body.dataset.theme = themeToggle.checked ? 'dark' : 'light';
    });

    // --- Event Listeners ---
    parseBtn.addEventListener('click', parseInsert);
    clearBtn.addEventListener('click', clearAll);
    addRowBtn.addEventListener('click', () => addRow('', ''));
    generateBtn.addEventListener('click', generateInsert);
    copyBtn.addEventListener('click', copyToClipboard);

    function clearAll() {
        sqlInput.value = '';
        editorSection.classList.add('hidden');
        outputSection.classList.add('hidden');
        dataTableBody.innerHTML = '';
        outputSQL.textContent = '';
        tableName = '';
        columns = [];
    }

    function parseInsert() {
        const input = sqlInput.value.trim();
        if (!input) {
            alert('Please paste an INSERT script.');
            return;
        }

        // A single, more robust regex to capture table, columns, and values
        const sqlRegex = /insert\s+into\s+([`\"\\]?\w+[`\"\\]?)\s*\(([\s\S]+?)\)\s*values\s*\(([\s\S]+?)\)\s*;?/i;
        const match = input.match(sqlRegex);

        if (!match) {
            alert('Invalid INSERT statement format. Could not parse the script. Ensure it is a single INSERT statement.');
            return;
        }

        tableName = match[1].replace(/[`\"\\]/g, '');
        const colsString = match[2];
        const valsString = match[3];

        const parsedColumns = colsString.split(',').map(c => c.trim().replace(/[`\"\\]/g, ''));
        
        // Regex to split values by comma, but ignoring commas inside single quotes.
        const parsedValues = valsString.match(/('[^']*'|[^,]+)/g).map(v => v.trim());

        if (parsedColumns.length !== parsedValues.length) {
            console.error("Columns:", parsedColumns);
            console.error("Values:", parsedValues);
            alert(`Number of columns (${parsedColumns.length}) and values (${parsedValues.length}) do not match.`);
            return;
        }

        columns = parsedColumns;
        dataTableBody.innerHTML = '';
        columns.forEach((col, i) => {
            addRow(col, parsedValues[i]);
        });

        editorSection.classList.remove('hidden');
        outputSection.classList.add('hidden');
    }

    function addRow(columnName, value) {
        const row = document.createElement('tr');

        const colCell = document.createElement('td');
        const colInput = document.createElement('input');
        colInput.type = 'text';
        colInput.value = columnName;
        colInput.placeholder = 'Column Name';
        colCell.appendChild(colInput);

        const valCell = document.createElement('td');
        const valInput = document.createElement('input');
        valInput.type = 'text';
        valInput.value = value;
        valInput.placeholder = 'Value';
        valCell.appendChild(valInput);

        const actionsCell = document.createElement('td');
        actionsCell.classList.add('actions');
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.classList.add('btn', 'btn-danger');
        removeBtn.addEventListener('click', () => row.remove());
        actionsCell.appendChild(removeBtn);

        row.appendChild(colCell);
        row.appendChild(valCell);
        row.appendChild(actionsCell);
        dataTableBody.appendChild(row);
    }

    function generateInsert() {
        const rows = dataTableBody.querySelectorAll('tr');
        if (rows.length === 0) {
            alert('No data to generate SQL.');
            return;
        }

        const generatedColumns = [];
        const generatedValues = [];

        rows.forEach(row => {
            const inputs = row.querySelectorAll('input[type="text"]');
            const col = inputs[0].value.trim();
            const val = inputs[1].value.trim();

            if (col) { // Only include if column name is not empty
                generatedColumns.push(`\`${col}\``);
                generatedValues.push(formatValue(val));
            }
        });

        if (generatedColumns.length === 0) {
            alert('Please provide at least one column name.');
            return;
        }

        const formattedCols = generatedColumns.join(', ');
        const formattedVals = generatedValues.join(', ');

        const output = `INSERT INTO ${tableName} (${formattedCols})\nVALUES (${formattedVals});`;
        outputSQL.textContent = output;
        outputSection.classList.remove('hidden');
    }

    function formatValue(v) {
        if (v.toLowerCase() === 'null' || /^(current_date|sysdate)$/i.test(v) || /^\w+\.nextval$/i.test(v)) {
            return v;
        }
        if (!isNaN(v) && v.trim() !== '') {
            return v; // It's a number
        }
        // It's a string, so quote it, escaping single quotes inside
        return `'${v.replace(/'/g, "''")}'`;
    }

    function copyToClipboard() {
        if (!outputSQL.textContent) return;
        navigator.clipboard.writeText(outputSQL.textContent).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            alert('Failed to copy text.');
        });
    }
});
