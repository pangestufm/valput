const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const XLSX = require('../.qa/xlsx.cjs');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
const message = 'format salah, pastikan file excel diambil dari detail kertas kerja capaian output';

function app() {
    const elements = new Map();
    const alerts = [];
    const get = id => {
        if (!elements.has(id)) elements.set(id, {
            style: {}, innerHTML: '', innerText: '', textContent: '', disabled: false,
            files: [], value: '', hidden: true, setAttribute() {}, removeAttribute() {}
        });
        return elements.get(id);
    };
    const context = vm.createContext({
        XLSX, Uint8Array, Intl, console, Date, Number, Math,
        localStorage: { getItem: () => null, setItem() {} },
        navigator: { clipboard: { writeText: async () => {} } },
        document: { getElementById: get, documentElement: get('root') },
        alert: text => alerts.push(text), setTimeout: fn => fn()
    });
    vm.runInContext(scripts, context);
    return { context, get, alerts, call: code => vm.runInContext(code, context) };
}

function headers() {
    const first = ['NO', 'Kode Satker', 'Nama Satker', 'Kode Eselon 1', 'Periode', 'Program', 'Kegiatan', 'KRO/RO', 'Uraian RO', 'Belanja Data OMSPAN', null, null, 'Keluaran Data SAKTI'];
    first[20] = 'GAP'; first[21] = 'Kode Ket';
    const second = Array(22).fill(null);
    ['Pagu', 'Realisasi*', '%', 'Target', 'Satuan', 'Bulan Ini'].forEach((v,i) => second[9+i] = v);
    second[17] = 'S.d Bulan Ini';
    const third = Array(22).fill(null);
    ['RVRO', 'TPCRO (%)', 'PCRO (%)', 'RVRO', 'TPCRO (%)', 'PCRO (%)'].forEach((v,i) => third[14+i] = v);
    return [first, second, third];
}

function dataRows() {
    return [
        ['1', '000001', 'SATKER UJI', '00000', '7', 'AA', '0001', 'UJI001', 'Output Uji 1', 1000000, 687729, 687729223189949, '10', 'Orang', '0', '8.37', '10.13', '0', '58.35', '68.77', '0', '00'],
        ['2', '000001', 'SATKER UJI', '00000', '7', 'BB', '0002', 'UJI002', 'Output Uji 2', 1000000, 946294, "'94.62936745949672", '1', 'Layanan', '0', '8.33', '2.95', '0', '58.31', '94.63', '0', '00']
    ];
}

test('input menjelaskan Excel dan tidak menerima CSV', () => {
    assert.equal(/accept="\.xlsx,\s*\.xls"/.test(html), true);
    assert.equal(/wajib[^<]*Excel/i.test(html), true);
});

test('header bertingkat diterima meski jumlah baris judul berubah', () => {
    const a = app();
    const input = [['Detail Kertas Kerja Capaian RO'], [], [], ...headers(), ...dataRows()];
    const out = a.context.validateWorksheetRows(input);
    assert.equal(out.length, 2);
    assert.equal(out[0][7], 'UJI001');
});

test('workbook lain dan kolom yang bergeser ditolak', () => {
    const a = app();
    assert.throws(() => a.context.validateWorksheetRows([['Nama', 'Nilai'], ['Orang', 100]]), /format salah/);
    const shifted = headers().map(row => [null, ...row]);
    assert.throws(() => a.context.validateWorksheetRows([...shifted, ...dataRows()]), /format salah/);
    const swappedGroups = headers();
    [swappedGroups[1][14], swappedGroups[1][17]] = [swappedGroups[1][17], swappedGroups[1][14]];
    assert.throws(() => a.context.validateWorksheetRows([...swappedGroups, ...dataRows()]), /format salah/);
});

test('header judul tidak dianggap data dan angka wajib rusak ditolak', () => {
    const a = app();
    const rows = dataRows(); rows[0][19] = 'bukan angka';
    assert.throws(() => a.context.validateWorksheetRows([...headers(), ...rows]), /format salah/);
    assert.throws(() => a.context.validateWorksheetRows(headers()), /tidak memiliki baris data/i);
});

test('signature file memisahkan Excel dari CSV yang diganti nama', () => {
    const a = app();
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...headers(), ...dataRows()]), 'Data');
    const xlsx = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const xls = XLSX.write(wb, { type: 'buffer', bookType: 'xls' });
    assert.equal(a.context.isExcelFile(xlsx, 'data.XLSX'), true);
    assert.equal(a.context.isExcelFile(xls, 'data.xls'), true);
    assert.equal(a.context.isExcelFile(Buffer.from('NO,Kode Satker\n1,576008'), 'data.xlsx'), false);
    assert.equal(a.context.isExcelFile(xlsx, 'data.csv'), false);
    assert.equal(a.context.isExcelFile(Buffer.alloc(0), 'data.xlsx'), false);
});

test('L sesuai dipertahankan dan anomali dihitung manual dengan toleransi 0,01', () => {
    const a = app();
    const resolve = (l,j,k) => a.context.resolveRealisasi(l,j,k);
    assert.equal(resolve(40.005, 100, 40).source, 'Excel');
    assert.equal(resolve(40.01, 100, 40).source, 'Excel');
    assert.equal(resolve(40.011, 100, 40).source, 'Hitung manual');
    assert.equal(resolve(40.4, 100, 40).value, 40);
    assert.equal(resolve("'94.62936745949672", 1000000, 946294).source, 'Excel');
    assert.equal(resolve("'68,77%", 1000000, 687729).source, 'Excel');
    assert.equal(resolve(687729223189949, 1000000, 687729).value.toFixed(2), '68.77');
    assert.equal(resolve('40salah', 100, 40).source, 'Hitung manual');
    assert.equal(resolve(75, 0, 0).value, 75);
    assert.equal(resolve('salah', 0, 0).value, 0);
    assert.equal(resolve(Infinity, 100, 40).value, 40);
});

test('validasi memakai L efektif dan mempertahankan aturan kode 99', () => {
    const a = app();
    a.context.renderTable(dataRows());
    assert.equal(a.get('countTotal').innerText, 2);
    assert.equal(a.get('countValid').innerText, 2);
    assert.match(a.get('result').innerHTML, /68\.77%/);
    const rows = dataRows(); rows[0][21] = '99'; rows[0][19] = '50';
    a.context.renderTable(rows);
    assert.equal(a.get('countError').innerText, 1);
    assert.match(a.get('result').innerHTML, /28\.90%/);
    assert.match(a.get('result').innerHTML, /Ganti Kode Ket/);
});

test('ekspor Excel round-trip memuat semua hasil, alasan, dan angka bertipe benar', () => {
    const a = app();
    const rows = dataRows(); rows[0][21] = '99'; rows[0][19] = '50';
    a.context.renderTable(rows);
    const exportRows = a.call('validationResults');
    const wb = a.context.createExportWorkbook(exportRows, 'contoh.xlsx');
    const bytes = XLSX.write(wb, {type:'buffer',bookType:'xlsx'});
    const imported = XLSX.read(bytes, {type:'buffer',cellNF:true});
    assert.deepEqual(imported.SheetNames, ['Hasil Validasi', 'Ringkasan']);
    const sheet = imported.Sheets['Hasil Validasi'];
    const exported = XLSX.utils.sheet_to_json(sheet);
    assert.equal(exported.length, 2);
    assert.equal(exported[0]['Status Validasi'], 'Perbaikan');
    assert.equal(exported[1]['Status Validasi'], 'Valid');
    assert.equal(exported[0]['Pagu'], 1000000);
    assert.equal(exported[0]['Belanja (%)'], 0.6877);
    assert.equal(exported[0]['Saran PCRO Bulan Ini (%)'], 0.289);
    assert.match(exported[0]['Alasan'], /Kode Keterangan terisi 99/);
    assert.equal(exported[0]['Sumber Belanja (%)'], 'Hitung manual');
    assert.equal(exported[1]['Sumber Belanja (%)'], 'Excel');
    assert.equal(sheet.K2.t, 'n');
    assert.equal(sheet.K2.z, '0.00%');
    assert.equal(imported.Sheets['Ringkasan'].B4.v, 2);
});

test('pilihan file baru menghapus hasil lama; ekstensi salah memunculkan notif tepat', () => {
    const a = app();
    a.context.renderTable(dataRows());
    assert.equal(a.get('exportButton').disabled, false);
    a.context.updateFileName({files:[{name:'data.csv'}]});
    assert.equal(a.get('exportButton').disabled, true);
    assert.equal(a.call('validationResults.length'), 0);
    assert.equal(a.get('uploadNotification').textContent, message);
    assert.equal(a.get('loading').style.display, 'none');
});

test('parser membaca file XLSX/XLS, persen Excel, dan menolak file rusak', () => {
    const a = app();
    for (const bookType of ['xlsx', 'xls']) {
        const wb = XLSX.utils.book_new();
        const rows = dataRows();
        rows[0][11] = 0.6877;
        const sheet = XLSX.utils.aoa_to_sheet([...headers(), ...rows]);
        sheet.L4.z = '0.00%';
        XLSX.utils.book_append_sheet(wb, sheet, 'Data');
        const parsed = a.context.readValidationRows(XLSX.write(wb, {type:'buffer',bookType}), `data.${bookType}`);
        assert.equal(parsed.length, 2);
        assert.equal(parsed[0][11].toFixed(2), '68.77');
    }
    assert.throws(() => a.context.readValidationRows(Buffer.from('NO,Kode Satker'), 'data.xlsx'), /format salah/);
});

test('read error menghentikan loading dan menonaktifkan export', () => {
    const a = app();
    a.get('excelFileInput').files = [{name:'rusak.xlsx'}];
    a.context.FileReader = class { readAsArrayBuffer() { this.onerror(); } };
    a.context.startProcessing();
    assert.equal(a.get('loading').style.display, 'none');
    assert.equal(a.get('processButton').disabled, false);
    assert.equal(a.get('exportButton').disabled, true);
    assert.equal(a.get('uploadNotification').textContent, message);
});

test('hasil pembacaan lama tidak menimpa pilihan file terbaru', () => {
    const a = app();
    let reader;
    a.context.FileReader = class { constructor() { reader = this; } readAsArrayBuffer() {} };
    a.get('excelFileInput').files = [{name:'lama.xlsx'}];
    a.context.startProcessing();
    a.context.updateFileName({files:[{name:'baru.xlsx'}]});
    reader.onload({target:{result:Buffer.from('salah')}});
    assert.equal(a.get('uploadNotification').textContent, '');
    assert.equal(a.get('exportButton').disabled, true);
    assert.equal(a.get('fileNameDisplay').textContent, 'baru.xlsx dipilih.');
});

test('nama Satker ditampilkan sebagai teks dan diekspor tanpa formula', () => {
    const a = app();
    const rows = dataRows(); rows[0][2] = '<img src=x onerror=alert(1)>'; rows[1][2] = '=1+1';
    a.context.renderTable(rows);
    assert.equal(a.get('result').innerHTML.includes('<img src=x'), false);
    const wb = a.context.createExportWorkbook(a.call('validationResults'), 'uji.xlsx');
    assert.equal(wb.Sheets['Hasil Validasi'].C3.t, 's');
    assert.equal(wb.Sheets['Hasil Validasi'].C3.f, undefined);
});

module.exports = { headers, dataRows };

test('kode keterangan kosong tidak menggagalkan validasi atau ekspor', () => {
    const a = app();
    const rows = dataRows(); rows[0][21] = null;
    a.context.renderTable(rows);
    assert.equal(a.get('countValid').innerText, 2);
    assert.equal(a.context.createExportWorkbook(a.call('validationResults'), 'uji.xlsx').Sheets['Hasil Validasi'].R2.v, '');
});

function correctionRow(overrides = {}) {
    const row = dataRows()[0];
    Object.assign(row, { 9: 1000000, 10: 703200, 11: 70.32, 12: 12,
        14: -2, 16: -20, 17: 10, 18: 83.3, 19: 80, 21: '00' }, overrides);
    return row;
}

test('koreksi dari PCRO 100% memberi -16,70% dan alternatif RVRO bersyarat', () => {
    const a = app();
    a.context.renderTable([correctionRow()]);
    const result = a.call('validationResults[0]');
    assert.equal(result.saranPcro, -16.7);
    assert.equal(result.rekomendasi.length, 2);
    assert.match(result.rekomendasi[0], /Opsi 1.*-16\.70%.*83\.30%/);
    assert.match(result.rekomendasi[1], /Opsi 2.*volume.*terealisasi.*RVRO Bulan ini: 0.*12.*PCRO Bulan ini: 0\.00%.*100\.00%/);
    assert.match(a.get('recap-list').innerHTML, /Opsi 1.*-16\.70%/s);
    assert.match(a.get('recap-list').innerHTML, /Opsi 2.*RVRO Bulan ini: 0/s);
    const sheet = a.context.createExportWorkbook(a.call('validationResults'), 'uji.xlsx').Sheets['Hasil Validasi'];
    const bytes = XLSX.write({SheetNames:['Hasil Validasi'],Sheets:{'Hasil Validasi':sheet}}, {type:'buffer',bookType:'xlsx'});
    const restored = XLSX.read(bytes,{type:'buffer',cellNF:true}).Sheets['Hasil Validasi'];
    assert.ok(Math.abs(restored.U2.v - (-0.167)) < 1e-12);
    assert.equal(restored.U2.z, '0.00%');
    assert.match(restored.V2.v, /Opsi 2/);
});

test('koreksi -42% menjadi -20% dan opsi RVRO +3 tidak disebut pengurangan', () => {
    const a = app();
    a.context.renderTable([correctionRow({10:571400,11:57.14,12:7,14:0,16:-42,17:4,18:80,19:58})]);
    const result = a.call('validationResults[0]');
    assert.equal(result.saranPcro, -20);
    assert.match(result.rekomendasi[1], /RVRO Bulan ini: \+3.*7/);
    assert.doesNotMatch(result.rekomendasi[1], /turunkan|kurangi/i);
});

test('opsi RVRO negatif dihitung dari volume sebelumnya, bukan dari kumulatif saat ini', () => {
    const a = app();
    a.context.renderTable([correctionRow({12:10,14:-5,17:8})]);
    assert.match(a.call('validationResults[0].rekomendasi[1]'), /RVRO Bulan ini: -3.*10/);
});

test('koreksi tetap mengikuti %belanja jika lebih tinggi dari TPCRO', () => {
    const a = app();
    a.context.renderTable([correctionRow({10:932200,11:93.22})]);
    const result = a.call('validationResults[0]');
    assert.equal(result.saranPcro, -6.78);
    assert.match(result.rekomendasi[0], /93\.22%/);
});

test('alternatif tidak muncul untuk koreksi biasa, hasil valid, atau RVRO sudah mencapai target', () => {
    const a = app();
    a.context.renderTable([correctionRow({16:-10})]);
    assert.equal(a.call('validationResults[0].saranPcro'), -6.7);
    assert.equal(a.call('validationResults[0].rekomendasi.length'), 1);
    a.context.renderTable([correctionRow({16:0,19:100})]);
    assert.equal(a.call('validationResults[0].status'), 'Valid');
    a.context.renderTable([correctionRow({17:12})]);
    assert.equal(a.call('validationResults[0].saranPcro'), 0);
    assert.equal(a.call('validationResults[0].rekomendasi.length'), 1);
});

test('RVRO bulanan kosong tidak dijadikan nol untuk mengarang alternatif volume', () => {
    const a = app();
    a.context.renderTable([correctionRow({14:null})]);
    assert.equal(a.call('validationResults[0].saranPcro'), -16.7);
    assert.equal(a.call('validationResults[0].rekomendasi.length'), 1);
});
