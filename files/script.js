$(document).ready(function() {
    $('#fileInput').on('change', handleFile);

    const requiredColumns = [
        'ELEMENTO', 'ELEMENTO ID', 'ID BDE', 'ID PAGOTRAN', 'DESCRIPCION',
        'FECHA DE ENTRADA EN SERVICIO COMERCIAL', 'ID AGENTE', 'NEMO AGE'
    ];

    const tableColumns = [
        'HOJA', 'ELEMENTO', 'ELEMENTO ID', 'ID BDE', 'ID PAGOTRAN', 'DESCRIPCION',
        'TENSION NOMINAL [KV]', 'POTENCIA NOMINAL [MVA]', 'LONGITUD [KM]',
        'FECHA DE ENTRADA EN SERVICIO COMERCIAL', 'ID AGENTE', 'NEMO AGE', 'OTROS'
    ];

    function normalizeString(str) {
        return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase() : '';
    }

    function formatDate(excelDate) {
        if (!excelDate || isNaN(excelDate)) return "N/C";
        const date = XLSX.SSF.parse_date_code(excelDate);
        if (!date) return "N/C";
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')} ${String(date.H).padStart(2, '0')}:${String(date.M).padStart(2, '0')}`;
    }

    function handleFile(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            processWorkbook(workbook);
        };

        reader.readAsArrayBuffer(file);
    }

    function processWorkbook(workbook) {
        const $tableHeader = $('#tableHeader');
        const $tableBody = $('#tableBody');

        // Limpiar la tabla antes de agregar nuevos datos
        $tableHeader.empty();
        $tableBody.empty();

        // Crear las cabeceras de la tabla
        tableColumns.forEach(col => {
            $tableHeader.append(`<th>${col}</th>`);
        });

        let isValid = true;
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
            if (worksheet.length === 0) return;

            const headers = worksheet[0].map(col => normalizeString(col));
            const sheetData = worksheet.slice(1);

            // Verificar si las columnas requeridas están presentes
            const missingColumns = requiredColumns.filter(col => !headers.includes(normalizeString(col)));
            if (missingColumns.length > 0) {
                console.error(`La hoja "${sheetName}" no tiene las columnas requeridas:`, missingColumns);
                isValid = false;
                return;
            }

            // Procesar datos si la hoja es válida
            sheetData.forEach(row => {
                const rowData = {};
                tableColumns.forEach(col => {
                    const normalizedCol = normalizeString(col);
                    const index = headers.indexOf(normalizedCol);
                    
                    // Formatear fecha correctamente si es la columna de "FECHA DE ENTRADA EN SERVICIO COMERCIAL"
                    if (normalizedCol === normalizeString('FECHA DE ENTRADA EN SERVICIO COMERCIAL') && index !== -1) {
                        rowData[col] = formatDate(row[index]);
                    } else {
                        rowData[col] = (index !== -1) ? (row[index] || "N/C") : "N/C";
                    }
                });

                // Extraer columnas adicionales no requeridas
                const extraColumns = {};
                headers.forEach((col, index) => {
                    if (!requiredColumns.includes(col) && !tableColumns.includes(col)) {
                        extraColumns[col] = row[index];
                    }
                });

                // Crear la fila para DataTables
                const rowHTML = `<tr>
                    <td>${sheetName}</td>
                    ${tableColumns.slice(1, -1).map(col => `<td>${rowData[col]}</td>`).join('')}
                    <td><pre>${JSON.stringify(extraColumns, null, 2).replaceAll('"','').replaceAll('{','').replaceAll('}','')}</pre></td>
                </tr>`;
                $tableBody.append(rowHTML);
            });
        });

        if (isValid) {
            $('#tabla').DataTable();
        } else {
            alert("El archivo tiene hojas que no cumplen con las columnas requeridas.");
        }
    }
});
