import React from 'react';

export const HEBREW_MONTHS_DATA = [
    { name: 'Nisan', hebrewScript: 'נִיסָן', tamil: 'நிசான்', gregorian: 'March/April', notes: 'Scriptural Month 1', holidays: 'Passover (Pesach)' },
    { name: 'Iyar', hebrewScript: 'אִייָר', tamil: 'இயார்', gregorian: 'April/May', notes: 'Scriptural Month 2' },
    { name: 'Sivan', hebrewScript: 'סִיוָן', tamil: 'சிவான்', gregorian: 'May/June', notes: 'Scriptural Month 3', holidays: 'Shavuot (Feast of Weeks)' },
    { name: 'Tammuz', hebrewScript: 'תַּמּוּז', tamil: 'தம்மூஸ்', gregorian: 'June/July', notes: 'Scriptural Month 4' },
    { name: 'Av', hebrewScript: 'אָב', tamil: 'ஆவ்', gregorian: 'July/August', notes: 'Scriptural Month 5' },
    { name: 'Elul', hebrewScript: 'אֱלוּל', tamil: 'எலூல்', gregorian: 'August/September', notes: 'Scriptural Month 6' },
    { name: 'Tishrei', hebrewScript: 'תִּשְׁרֵי', tamil: 'திஷ்ரே', gregorian: 'September/October', notes: 'Start of Civil Year (Rosh Hashanah)', holidays: 'High Holy Days (Rosh Hashanah, Yom Kippur, Sukkot)' },
    { name: 'Cheshvan', hebrewScript: 'חֶשְׁוָן', tamil: 'செஷ்வான்', gregorian: 'October/November', notes: 'Varies between 29 & 30 days' },
    { name: 'Kislev', hebrewScript: 'כִּסְלֵו', tamil: 'கிஸ்லேவ்', gregorian: 'November/December', notes: 'Varies between 29 & 30 days', holidays: 'Hanukkah' },
    { name: 'Tevet', hebrewScript: 'טֵבֵת', tamil: 'தேவேத்', gregorian: 'December/January', notes: 'Scriptural Month 10' },
    { name: 'Shevat', hebrewScript: 'שְׁבָט', tamil: 'ஷேவாட்', gregorian: 'January/February', notes: 'Scriptural Month 11' },
    { name: 'Adar', hebrewScript: 'אֲדָר', tamil: 'அதார்', gregorian: 'February/March', notes: 'Scriptural Month 12' }
];

export const KEY_DETAILS = [
    {
        title: 'Leap Year',
        desc: 'An extra month, Adar I, is added 7 times every 19 years to align with the solar year.'
    },
    {
        title: 'Length Variation',
        desc: 'Cheshvan and Kislev vary between 29 and 30 days to adjust the year length.'
    }
];

export const PrintableReferenceGuide: React.FC<{ year?: number }> = ({ year = 5786 }) => {
    return (
        <div id="printable-reference-guide" className="w-[800px] p-12 bg-white text-slate-900 font-sans border-t-[16px] border-brand-900">
            <div className="text-center mb-10 border-b-2 border-slate-100 pb-6">
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Hebrew Scriptural Calendar</h1>
                <p className="text-slate-500 uppercase tracking-widest text-sm font-bold">Month Reference Guide • Year {year}</p>
            </div>

            <div className="mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b-2 border-slate-200">
                            <th className="p-3 text-xs font-black uppercase tracking-widest text-slate-500">Month</th>
                            <th className="p-3 text-xs font-black uppercase tracking-widest text-slate-500">Hebrew</th>
                            <th className="p-3 text-xs font-black uppercase tracking-widest text-slate-500">Tamil</th>
                            <th className="p-3 text-xs font-black uppercase tracking-widest text-slate-500">Gregorian / Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {HEBREW_MONTHS_DATA.map((m, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                <td className="p-3 font-bold text-slate-900 border-r border-slate-100/50">
                                    {m.name}
                                </td>
                                <td className="p-3 text-slate-700 text-lg font-serif border-r border-slate-100/50" dir="rtl">
                                    {m.hebrewScript}
                                </td>
                                <td className="p-3 text-blue-700 text-sm font-bold border-r border-slate-100/50">
                                    {m.tamil}
                                </td>
                                <td className="p-3 text-slate-700 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-500 font-semibold">{m.gregorian}</span>
                                        {m.holidays && <span className="font-bold text-amber-700">{m.holidays}</span>}
                                        <span className="text-slate-400 text-xs italic">{m.notes}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Key Scriptural Details</h2>
                <div className="grid grid-cols-2 gap-8">
                    {KEY_DETAILS.map((d, i) => (
                        <div key={i}>
                            <h3 className="font-bold text-amber-600 mb-1 text-sm">{d.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{d.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-serif italic">City of Truth Ministries — Biblical Resources</p>
            </div>
        </div>
    );
};
