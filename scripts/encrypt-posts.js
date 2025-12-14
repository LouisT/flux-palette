'use strict';
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm',
    ITERATIONS = 100000,
    KEY_LEN = 32,
    DIGEST = 'sha256',
    SALT_LEN = 16,
    IV_LEN = 16;

hexo.extend.filter.register('after_post_render', async function (data) {
    // Check for password
    const password = data.password;
    if (!password)
        return data;

    // Generate Salt, IV and Key asynchronously
    const salt = await randomBytesAsync(SALT_LEN),
        iv = await randomBytesAsync(IV_LEN),
        key = await pbkdf2Async(password, salt, ITERATIONS, KEY_LEN, DIGEST);

    // Encrypt Content
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Construct Payload
    const encodedPayload = Buffer.from(JSON.stringify({
        ct: (cipher.update(data.content, 'utf8', 'base64') + cipher.final('base64')),
        s: salt.toString('base64'),
        iv: iv.toString('base64'),
        at: cipher.getAuthTag().toString('base64'),
        i: ITERATIONS
    })).toString('base64');

    // Replace content with UI Placeholder
    data.content = `
    <div class="encrypted-post" id="encrypted-${data.slug}" data-slug="${data.slug}" data-payload="${encodedPayload}">
      <div class="encrypted-form">
        <div class="encrypted-input-wrap">
          <input
            type="password"
            class="encrypted-input"
            id="pass-${data.slug}"
            placeholder=" "
            autocomplete="off"
          >
          <label class="encrypted-label">Enter password</label>
        </div>
        <button type="button" class="encrypted-button" id="btn-${data.slug}">Unlock</button>
        <p class="encrypted-error" id="error-${data.slug}" style="display:none;"></p>
      </div>
      <div class="encrypted-post-content" id="content-${data.slug}" style="display:none;"></div>
    </div>`;

    // Data Hygiene
    data.excerpt = '<p>This post has been password protected.</p>';
    data.more = ''; // Clear "read more" content to prevent leaks

    // Remove the plaintext password from the object so it doesn't leak into JSON/XML feeds
    delete data.password;
    data.encrypted = true;

    return data;
});

// Helper Functions
function randomBytesAsync(size) {
    return new Promise((res, rej) => crypto.randomBytes(size, (err, buf) => (err || !buf) ? rej(err) : res(buf)));
}
function pbkdf2Async(password, salt, iterations, keylen, digest) {
    return new Promise((res, rej) => crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => (err || !derivedKey) ? rej(err) : res(derivedKey)));
}