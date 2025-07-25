document.addEventListener('DOMContentLoaded', () => {
    // --- General Elements ---
    const themeToggle = document.getElementById('theme-toggle');
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // --- SQL Insert Editor Elements ---
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

    // --- Column Parser Elements ---
    const columnInput = document.getElementById('columnInput');
    const parseColumnBtn = document.getElementById('parseColumn');
    const clearColumnBtn = document.getElementById('clearColumn');
    const columnOutputSection = document.getElementById('columnOutputSection');
    const commaOutput = document.getElementById('commaOutput');
    const quotedOutput = document.getElementById('quotedOutput');
    const copyCommaBtn = document.getElementById('copyComma');
    const copyQuotedBtn = document.getElementById('copyQuoted');

    let tableName = '';
    let columns = [];

    // --- Theme Switcher ---
    // Set initial theme based on body attribute
    if (document.body.dataset.theme === 'dark') {
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        document.body.dataset.theme = themeToggle.checked ? 'dark' : 'light';
    });

    // --- Tab Functionality ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                content.classList.add('hidden');
            });

            const tabId = tab.dataset.tab;
            const activeTab = document.getElementById(tabId);
            activeTab.classList.add('active');
            activeTab.classList.remove('hidden');
        });
    });

    // --- SQL Insert Editor Logic ---
    if (parseBtn) {
        parseBtn.addEventListener('click', parseInsert);
        clearBtn.addEventListener('click', clearAll);
        addRowBtn.addEventListener('click', () => addRow('', ''));
        generateBtn.addEventListener('click', generateInsert);
        copyBtn.addEventListener('click', () => copyToClipboard(outputSQL, copyBtn));
    }

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

        const sqlRegex = /insert\s+into\s+([`"\\]?\w+[`"\\]?)\s*\(([\s\S]+?)\)\s*values\s*\(([\s\S]+?)\)\s*;?/i;
        const match = input.match(sqlRegex);

        if (!match) {
            alert('Invalid INSERT statement format. Could not parse the script. Ensure it is a single INSERT statement.');
            return;
        }

        tableName = match[1].replace(/[`"\\]/g, '');
        const colsString = match[2];
        const valsString = match[3];

        const parsedColumns = colsString.split(',').map(c => c.trim().replace(/[`"\\]/g, ''));
        const parsedValues = valsString.match(/('[^']*'|[^,]+)/g).map(v => {
            let value = v.trim();
            if (value.startsWith("'") && value.endsWith("'")) {
                value = value.substring(1, value.length - 1);
            }
            return value;
        });

        if (parsedColumns.length !== parsedValues.length) {
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
        row.innerHTML = `
            <td><input type="text" value="${columnName}" placeholder="Column Name"></td>
            <td><input type="text" value="${value}" placeholder="Value"></td>
            <td class="actions">
                <button class="btn btn-danger"><i class="fas fa-trash"></i></button>
            </td>
        `;
        row.querySelector('.btn-danger').addEventListener('click', () => row.remove());
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

            if (col) {
                generatedColumns.push(col);
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
            return v;
        }
        return `'${v.replace(/'/g, "''")}'`;
    }

    // --- Column Parser Logic ---
    if (parseColumnBtn) {
        parseColumnBtn.addEventListener('click', parseColumnData);
        clearColumnBtn.addEventListener('click', clearColumnParser);
        copyCommaBtn.addEventListener('click', () => copyToClipboard(commaOutput, copyCommaBtn));
        copyQuotedBtn.addEventListener('click', () => copyToClipboard(quotedOutput, copyQuotedBtn));
    }

    function parseColumnData() {
        const input = columnInput.value.trim();
        if (!input) {
            alert('Please paste some column data.');
            return;
        }

        const lines = input.split(/\r?\n/).filter(line => line.trim() !== '');
        
        const commaSeparated = lines.join(',');
        const quotedCommaSeparated = lines.map(line => `'${line.replace(/'/g, "''")}'`).join(',');

        commaOutput.textContent = commaSeparated;
        quotedOutput.textContent = quotedCommaSeparated;

        columnOutputSection.classList.remove('hidden');
    }

    function clearColumnParser() {
        columnInput.value = '';
        commaOutput.textContent = '';
        quotedOutput.textContent = '';
        columnOutputSection.classList.add('hidden');
    }

    // --- Generic Helper Functions ---
    function copyToClipboard(element, button) {
        if (!element.textContent) return;
        navigator.clipboard.writeText(element.textContent).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            alert('Failed to copy text.');
        });
    }
});