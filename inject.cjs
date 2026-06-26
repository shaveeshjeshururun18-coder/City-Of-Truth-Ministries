const fs = require('fs');
let code = fs.readFileSync('components/AdminDashboard.tsx', 'utf8');

const target = '                    </div>{/* /Main Content */}';
const replacement = `
                <AnimatePresence>
                    {activeTab === 'baruch-hashem' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-8"
                        >
                            <BaruchVideosManager />
                        </motion.div>
                    )}
                </AnimatePresence>
                    </div>{/* /Main Content */}`;

code = code.replace(target, replacement);
fs.writeFileSync('components/AdminDashboard.tsx', code);
console.log('Replaced');
