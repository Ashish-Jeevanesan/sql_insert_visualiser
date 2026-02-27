# DataWand - SQL & Data Tools

A sleek and intuitive web-based toolkit for developers. DataWand provides a set of handy utilities to streamline common data and SQL-related tasks.

![DataWand Screenshot](https://i.ibb.co/3Y9fV2C/image.png)

## ✨ Features

### 1. SQL Insert Editor
-   **Parse SQL:** Paste a full `INSERT INTO` statement, and the tool will automatically extract the table name, columns, and values.
-   **Editable Grid:** Displays columns and values in a clean, user-friendly table.
-   **Dynamic Editing:** Modify columns and values, add new rows, or delete existing ones on the fly.
-   **SQL Generation:** Re-creates the `INSERT` statement based on your edits.
-   **Smart Value Formatting:** Automatically handles numeric values, strings (with proper single-quote escaping), and SQL keywords like `NULL` or `SYSDATE`.

### 2. Column Parser
-   **Parse Column Data:** Paste a column of data from Excel, a SQL query result, or any other source.
-   **Multiple Formats:** Instantly generate both a standard comma-separated list and a comma-separated list with quotes, perfect for `IN` clauses.

### 3. Line Number Remover
-   **Clean Up Code:** Paste code or text that has line numbers, and the tool will instantly remove them.
-   **Multi-line Support:** Works with code snippets of any length.

### 4. HashMap Log Viewer
-   **Parse Logs:** Paste a HashMap log and parse it into a grouped, readable table.
-   **Key Search:** Filter keys instantly with a search box.
-   **Copy on Click:** Click any value to copy it.
-   **CSV Export:** Export parsed data to CSV for quick analysis.
-   **Drag & Drop:** Drop a `.txt` log file to auto-parse.

### 5. Bulk Barcode & QR Generator
-   **Multiple Formats:** Generate GS1-128, CODE128, or QR codes.
-   **Batch Generation:** Paste one value per line and generate all at once.
-   **Download All:** Export all generated images as a zip file.

### General
-   **Copy to Clipboard:** Instantly copy any generated output with a single click.
-   **Dark/Light Mode:** Switch between a comfortable dark theme and a clean light theme.
-   **Responsive Design:** Fully functional on both desktop and mobile devices.

## 🚀 How to Use

1.  **Select a Tool:** Use the tabs at the top to switch between **SQL Insert Editor**, **Column Parser**, **Line Remover**, **HashMap Log Viewer**, and **Barcode Generator**.
2.  **Input Data:** Paste your data into the appropriate input area.
3.  **Parse & Edit:** Use the available buttons to parse, edit, and generate your desired output.
4.  **Copy:** Click the **<i class="fas fa-copy"></i> Copy** button to copy the results to your clipboard.

## 🛠️ Technologies Used

-   **HTML5:** For the core structure of the application.
-   **CSS3:** For styling, including modern features like variables for easy theming and a responsive grid layout.
-   **Vanilla JavaScript:** For all the application logic, including parsing, DOM manipulation, and event handling. No frameworks needed!
-   **Font Awesome:** For clean and modern icons.

## 📄 License

This project is licensed under the MIT License.

---

Designed & Developed by [Ashish Jeevanesan](https://github.com/Ashish-Jeevanesan).
&copy; 2025 Ashish Jeevanesan / AJ. All Rights Reserved.
