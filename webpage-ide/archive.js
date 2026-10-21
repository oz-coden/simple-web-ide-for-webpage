(function (root, factory) {
    const createZip = factory();
    if (typeof module === 'object' && module.exports) module.exports = createZip;
    else root.createSourceZip = createZip;
})(globalThis, function () {
    'use strict';
    const encoder = new TextEncoder();
    const table = Uint32Array.from({ length: 256 }, (_, value) => {
        for (let i = 0; i < 8; i++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
        return value >>> 0;
    });
    function crc32(bytes) {
        let crc = 0xffffffff;
        for (const byte of bytes) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8);
        return (crc ^ 0xffffffff) >>> 0;
    }
    // Stored ZIP entries need no compression library; each UTF-8 file has a CRC32 checksum.
    return function createZip(files) {
        const local = [], central = [];
        let offset = 0, directorySize = 0;
        const now = new Date();
        const date = ((Math.min(2107, Math.max(1980, now.getFullYear())) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
        const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
        if (files.length > 65535) throw new Error('ZIPに含めるファイルが多すぎます。');
        for (const file of files) {
            const name = encoder.encode(file.name), data = encoder.encode(file.content);
            if (name.length > 65535 || data.length >= 0xffffffff || offset + 30 + name.length + data.length >= 0xffffffff) throw new Error('ZIPのサイズ上限を超えました。');
            const crc = crc32(data);
            const header = new Uint8Array(30 + name.length), view = new DataView(header.buffer);
            view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true);
            view.setUint16(6, 0x0800, true); view.setUint16(10, time, true); view.setUint16(12, date, true);
            view.setUint32(14, crc, true); view.setUint32(18, data.length, true); view.setUint32(22, data.length, true);
            view.setUint16(26, name.length, true); header.set(name, 30);
            const entry = new Uint8Array(46 + name.length), record = new DataView(entry.buffer);
            record.setUint32(0, 0x02014b50, true); record.setUint16(4, 20, true); record.setUint16(6, 20, true);
            record.setUint16(8, 0x0800, true); record.setUint16(12, time, true); record.setUint16(14, date, true);
            record.setUint32(16, crc, true); record.setUint32(20, data.length, true); record.setUint32(24, data.length, true);
            record.setUint16(28, name.length, true); record.setUint32(42, offset, true); entry.set(name, 46);
            local.push(header, data); central.push(entry);
            offset += header.length + data.length; directorySize += entry.length;
        }
        if (offset + directorySize + 22 >= 0xffffffff) throw new Error('ZIPのサイズ上限を超えました。');
        const end = new Uint8Array(22), record = new DataView(end.buffer);
        record.setUint32(0, 0x06054b50, true); record.setUint16(8, files.length, true); record.setUint16(10, files.length, true);
        record.setUint32(12, directorySize, true); record.setUint32(16, offset, true);
        return new Blob([...local, ...central, end], { type: 'application/zip' });
    };
});
