import fs from 'fs';

const htmlContent = fs.readFileSync('C:\\Users\\HP\\Downloads\\City of Truth Ministries - 3D Visiting Card.html', 'utf8');

// Match data:image/webp;base64,...
const matches = [...htmlContent.matchAll(/src="data:image\/webp;base64,([^"]+)"/g)];

if (matches.length >= 2) {
    const frontBase64 = matches[0][1];
    const backBase64 = matches[1][1];

    fs.writeFileSync('public/visiting-card-front.webp', Buffer.from(frontBase64, 'base64'));
    fs.writeFileSync('public/visiting-card-back.webp', Buffer.from(backBase64, 'base64'));
    console.log('Successfully extracted front and back images.');
} else {
    console.log('Could not find both images. Matches found:', matches.length);
}
