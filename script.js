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

    // --- Line Remover Elements ---
    const lineInput = document.getElementById('lineInput');
    const removeLinesBtn = document.getElementById('removeLines');
    const clearLinesBtn = document.getElementById('clearLines');
    const lineOutputSection = document.getElementById('lineOutputSection');
    const lineOutput = document.getElementById('lineOutput');
    const copyLinesBtn = document.getElementById('copyLines');

    // --- HashMap Parser Elements ---
    const hashmapParseBtn = document.getElementById('hashmap-parse');
    const hashmapExportBtn = document.getElementById('hashmap-export');
    const hashmapToggleThemeBtn = document.getElementById('hashmap-toggle-theme');
    const hashmapSearch = document.getElementById('hashmap-search');
    const hashmapInput = document.getElementById('hashmap-input');
    const hashmapDropZone = document.getElementById('hashmap-drop-zone');
    const hashmapOutput = document.getElementById('hashmap-output');

    // --- Barcode Generator Elements ---
    const barcodeType = document.getElementById('barcode-type');
    const barcodeData = document.getElementById('barcode-data');
    const barcodeGenerateBtn = document.getElementById('barcode-generate');
    const barcodeDownloadBtn = document.getElementById('barcode-download');
    const barcodeOutput = document.getElementById('barcode-output');

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

    // --- Line Remover Logic ---
    if (removeLinesBtn) {
        removeLinesBtn.addEventListener('click', removeLineNumbers);
        clearLinesBtn.addEventListener('click', clearLineRemover);
        copyLinesBtn.addEventListener('click', () => copyToClipboard(lineOutput, copyLinesBtn));
    }

    function removeLineNumbers() {
        const input = lineInput.value;
        if (!input) {
            alert('Please paste some code.');
            return;
        }

        // Use a global and multiline regex to remove numbers from the start of each line.
        const formattedCode = input.replace(/^\s*\d+\s*/gm, '');

        lineOutput.textContent = formattedCode;
        lineOutputSection.classList.remove('hidden');
    }

    function clearLineRemover() {
        lineInput.value = '';
        lineOutput.textContent = '';
        lineOutputSection.classList.add('hidden');
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

    // --- HashMap Parser Logic ---
    const IMPORTANT_KEYS = ["INV", "ACCID", "INV_AMT", "INVDT", "PAYNM", "CURRENCY"];
    const GROUPS = {
        "Billing": ["BILL", "ACC", "PAY", "VAT", "CURRENCY"],
        "Shipping": ["SHIP", "PLANT", "DELIVERY"],
        "Finance": ["INV", "AMT", "TAX", "DIST", "COMP"],
        "General": []
    };
    let hashmapParsedData = [];

    if (hashmapParseBtn) {
        hashmapParseBtn.addEventListener('click', parseHashmap);
        hashmapExportBtn.addEventListener('click', exportHashmapCSV);
        hashmapSearch.addEventListener('input', filterHashmapKeys);
        hashmapToggleThemeBtn.addEventListener('click', () => {
            themeToggle.checked = !themeToggle.checked;
            document.body.dataset.theme = themeToggle.checked ? 'dark' : 'light';
        });
    }

    function parseHashmap() {
        const raw = hashmapInput.value.trim();
        if (!raw) return;

        hashmapParsedData = [];
        const clean = raw.replace(/^{|}$/g, '');
        const pairs = clean.split(/,\s*(?=[A-Z0-9_]+=)/);

        pairs.forEach(p => {
            const i = p.indexOf('=');
            if (i === -1) return;
            hashmapParsedData.push({
                key: p.substring(0, i).trim(),
                value: p.substring(i + 1).trim()
            });
        });

        renderHashmap(hashmapParsedData);
    }

    function renderHashmap(data) {
        hashmapOutput.innerHTML = '';

        for (const [group, keywords] of Object.entries(GROUPS)) {
            const groupItems = data.filter(d =>
                keywords.length === 0
                    ? !Object.values(GROUPS).flat().some(k => d.key.includes(k))
                    : keywords.some(k => d.key.includes(k))
            );

            if (!groupItems.length) continue;

            const section = document.createElement('div');
            section.className = 'section';
            section.innerHTML = `<h3>${group}</h3>`;

            let table = '<table><tr><th>Key</th><th>Value</th></tr>';
            groupItems.forEach(({ key, value }) => {
                const highlight = IMPORTANT_KEYS.includes(key) ? 'highlight' : '';
                const val = value.includes('<div>') || value.includes('<br>')
                    ? value
                    : escapeHtml(value);

                table += `
                    <tr class="${highlight}">
                        <th>${key}</th>
                        <td class="value" data-copy="${escapeHtml(value)}">${val}</td>
                    </tr>`;
            });

            table += '</table>';
            section.innerHTML += table;
            hashmapOutput.appendChild(section);
        }

        hashmapOutput.querySelectorAll('td.value').forEach(cell => {
            cell.addEventListener('click', () => copyHashmapValue(cell));
        });
    }

    function filterHashmapKeys() {
        const q = hashmapSearch.value.toLowerCase();
        renderHashmap(hashmapParsedData.filter(d => d.key.toLowerCase().includes(q)));
    }

    function copyHashmapValue(cell) {
        const text = cell.getAttribute('data-copy') || cell.innerText;
        navigator.clipboard.writeText(text);
        cell.style.background = 'rgba(34, 197, 94, 0.2)';
        setTimeout(() => cell.style.background = '', 500);
    }

    function exportHashmapCSV() {
        if (!hashmapParsedData.length) return;
        let csv = 'Key,Value\n';
        hashmapParsedData.forEach(d => {
            csv += `"${d.key}","${d.value.replace(/"/g, '""')}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'hashmap_log.csv';
        a.click();
    }

    function escapeHtml(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    if (hashmapDropZone) {
        hashmapDropZone.addEventListener('dragover', e => {
            e.preventDefault();
            hashmapDropZone.classList.add('dragover');
        });
        hashmapDropZone.addEventListener('dragleave', () => hashmapDropZone.classList.remove('dragover'));
        hashmapDropZone.addEventListener('drop', e => {
            e.preventDefault();
            hashmapDropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                hashmapInput.value = ev.target.result;
                parseHashmap();
            };
            reader.readAsText(file);
        });
    }

    // --- Barcode Generator Logic ---
    let barcodeImages = [];

    if (barcodeGenerateBtn) {
        barcodeGenerateBtn.addEventListener('click', generateBarcodes);
        barcodeDownloadBtn.addEventListener('click', downloadAllBarcodes);
    }

    function generateBarcodes() {
        barcodeImages = [];
        barcodeOutput.innerHTML = '';

        const values = barcodeData.value
            .split('\n')
            .map(v => v.trim())
            .filter(v => v);

        const type = barcodeType.value;

        values.forEach((text, i) => {
            const div = document.createElement('div');
            div.className = 'barcode-item';

            if (type === 'barcode' || type === 'gs1') {
                const svg = document.createElement('svg');
                JsBarcode(svg, text, {
                    format: 'CODE128',
                    gs1: type === 'gs1',
                    width: 2,
                    height: 90,
                    displayValue: true
                });
                div.appendChild(svg);
                barcodeImages.push(svg);
            } else {
                const canvas = document.createElement('canvas');
                QRCode.toCanvas(canvas, text, { width: 150 });
                div.appendChild(canvas);
                barcodeImages.push(canvas);
            }

            div.innerHTML += `<div>${escapeHtml(text)}</div>`;
            barcodeOutput.appendChild(div);
        });
    }

    async function downloadAllBarcodes() {
        if (!barcodeImages.length) return;
        const zip = new JSZip();

        barcodeImages.forEach((img, i) => {
            let dataUrl = img.toDataURL
                ? img.toDataURL()
                : 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(img));

            zip.file(`code_${i + 1}.png`, dataUrl.split(',')[1], { base64: true });
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        saveAs(blob, 'barcodes.zip');
    }
});
