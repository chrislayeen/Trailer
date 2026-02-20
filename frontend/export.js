import { format } from 'date-fns';

export const downloadCSV = (data, filename = 'export') => {
    if (!data || !data.length) {
        console.warn('No data to export');
        return;
    }

    // 1. Extract headers
    const headers = Object.keys(data[0]);

    // 2. Convert to CSV string
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');

    // 3. Trigger Download
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
