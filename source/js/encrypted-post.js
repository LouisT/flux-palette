(function () {
    if (!('crypto' in window) || !window.crypto.subtle)
        return alert('Your browser does not support the necessary cryptographic features to decrypt this post. Please use a modern browser.');

    // Return Uint8Array directly to avoid ArrayBuffer offset confusion
    function base64ToUint8Array(b64) {
        const binary = atob(b64),
            len = binary.length,
            bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++)
            bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    // Key Derivation (PBKDF2)
    async function deriveKey(password, salt, iterations) {
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: iterations,
                hash: 'SHA-256'
            },
            (await crypto.subtle.importKey(
                'raw',
                (new TextEncoder()).encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveKey']
            )),
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
    }

    // Decryption Logic
    async function decryptPayload(password, payload) {
        const salt = base64ToUint8Array(payload.s),
            iv = base64ToUint8Array(payload.iv),
            ciphertext = base64ToUint8Array(payload.ct),
            authTag = base64ToUint8Array(payload.at),
            iterations = payload.i;

        // Combine Ciphertext and Auth Tag, WebCrypto expects: [Ciphertext ............ | AuthTag (16 bytes)]
        const combinedData = new Uint8Array(ciphertext.length + authTag.length);
        combinedData.set(ciphertext);
        combinedData.set(authTag, ciphertext.length);

        // Decrypt (AES-GCM), 128-bit tag length is standard, return decoded string
        return (new TextDecoder()).decode(await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
                tagLength: 128
            },
            (await deriveKey(password, salt, iterations)),
            combinedData
        ));
    }

    // Unlock Logic, triggered on button click or Enter key
    async function handleUnlock(container) {
        const input = container.querySelector('.encrypted-input'),
            button = container.querySelector('.encrypted-button'),
            errorEl = container.querySelector('.encrypted-error'),
            contentEl = container.querySelector('.encrypted-post-content');

        if (!input || !button || !contentEl)
            return;

        // Reset Error UI
        if (errorEl) {
            errorEl.style.display = 'none';
            errorEl.textContent = '';
            if (errorEl._hideTimeout) {
                clearTimeout(errorEl._hideTimeout);
                errorEl._hideTimeout = null;
            }
        }

        function showError(msg) {
            if (!errorEl) return;
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
            if (errorEl._hideTimeout)
                clearTimeout(errorEl._hideTimeout);
            errorEl._hideTimeout = setTimeout(() => {
                errorEl.style.display = 'none';
                errorEl._hideTimeout = null;
            }, 10000);
        }

        const password = input.value || '';
        if (!password)
            return showError('Please enter a password.');

        const payloadEncoded = container.getAttribute('data-payload');
        if (!payloadEncoded)
            return showError('No encrypted data found.');

        let payload;
        try {
            payload = JSON.parse(atob(payloadEncoded));
        } catch (e) {
            return showError('Failed to parse encrypted data.');
        }

        button.disabled = true;
        try {
            contentEl.innerHTML = await decryptPayload(password, payload);
            contentEl.style.display = 'block';
            const form = container.querySelector('.encrypted-form');
            if (form)
                form.style.display = 'none';
        } catch (e) {
            showError('Incorrect password or decryption failed.');
        } finally {
            button.disabled = false;
        }
    }

    // Initialize event listeners on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.encrypted-post').forEach(container => {
            const btn = container.querySelector('.encrypted-button'),
                inp = container.querySelector('.encrypted-input');
            if (btn)
                btn.addEventListener('click', () => handleUnlock(container));
            if (inp)
                inp.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleUnlock(container);
                    }
                });
        });
    });
})();