/* ==============================================
   BUILT BY DENNY - BLOG ADMIN
   
   Handles the blog admin dashboard functionality.
   Communicates with Cloudflare Worker API for
   authentication and GitHub publishing.
   ============================================== */

(function() {
    'use strict';

    const CONFIG = {
        apiUrl: 'https://denny-blog-admin.micaiah-tasks.workers.dev',
        sessionKey: 'denny_blog_session',
        author: 'Denny Liuzzo'
    };

    let state = {
        authenticated: false,
        posts: [],
        currentPost: null,
        editingId: null,
        featuredImage: null
    };

    const elements = {
        loginScreen: document.getElementById('login-screen'),
        adminScreen: document.getElementById('admin-screen'),
        dashboardView: document.getElementById('dashboard-view'),
        editorView: document.getElementById('editor-view'),
        settingsView: document.getElementById('settings-view'),
        loginForm: document.getElementById('login-form'),
        passwordInput: document.getElementById('password'),
        loginError: document.getElementById('login-error'),
        postsContainer: document.getElementById('posts-container'),
        newPostBtn: document.getElementById('new-post-btn'),
        settingsBtn: document.getElementById('settings-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        editorBack: document.getElementById('editor-back'),
        settingsBack: document.getElementById('settings-back'),
        postTitle: document.getElementById('post-title'),
        postContent: document.getElementById('post-content'),
        linkBtn: document.getElementById('link-btn'),
        imageUpload: document.getElementById('image-upload'),
        imageInput: document.getElementById('image-input'),
        previewBtn: document.getElementById('preview-btn'),
        saveDraftBtn: document.getElementById('save-draft-btn'),
        publishBtn: document.getElementById('publish-btn'),
        previewModal: document.getElementById('preview-modal'),
        previewContent: document.getElementById('preview-content'),
        previewClose: document.getElementById('preview-close'),
        changePasswordForm: document.getElementById('change-password-form'),
        currentPasswordInput: document.getElementById('current-password'),
        newPasswordInput: document.getElementById('new-password'),
        confirmPasswordInput: document.getElementById('confirm-password'),
        notification: document.getElementById('notification'),
        notificationText: document.getElementById('notification-text'),
        loading: document.getElementById('loading')
    };

    function init() {
        checkSession();
        bindEvents();
    }

    function bindEvents() {
        elements.loginForm.addEventListener('submit', handleLogin);
        elements.logoutBtn.addEventListener('click', handleLogout);
        elements.newPostBtn.addEventListener('click', () => openEditor());
        elements.settingsBtn.addEventListener('click', showSettings);
        elements.editorBack.addEventListener('click', closeEditor);
        elements.settingsBack.addEventListener('click', showDashboard);
        elements.imageUpload.addEventListener('click', () => elements.imageInput.click());
        elements.imageInput.addEventListener('change', handleImageUpload);
        elements.linkBtn.addEventListener('click', handleInsertLink);
        elements.previewBtn.addEventListener('click', openPreview);
        elements.saveDraftBtn.addEventListener('click', () => savePost(false));
        elements.publishBtn.addEventListener('click', () => savePost(true));
        elements.previewClose.addEventListener('click', closePreview);
        elements.previewModal.addEventListener('click', (e) => {
            if (e.target === elements.previewModal) closePreview();
        });
        elements.changePasswordForm.addEventListener('submit', handleChangePassword);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closePreview();
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                if (elements.editorView.style.display !== 'none') {
                    e.preventDefault();
                    savePost(false);
                }
            }
            // Ctrl/Cmd + K for link shortcut
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                if (elements.editorView.style.display !== 'none') {
                    e.preventDefault();
                    handleInsertLink();
                }
            }
        });
    }

    function handleInsertLink() {
        const textarea = elements.postContent;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        if (!selectedText) {
            notify('Select some text first, then click the link button', 'error');
            textarea.focus();
            return;
        }
        
        const url = prompt('Enter the URL:', 'https://');
        
        if (url && url !== 'https://') {
            const linkMarkdown = `[${selectedText}](${url})`;
            
            // Replace selected text with markdown link
            textarea.value = textarea.value.substring(0, start) + linkMarkdown + textarea.value.substring(end);
            
            // Set cursor position after the inserted link
            const newCursorPos = start + linkMarkdown.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
            
            notify('Link added!');
        } else {
            textarea.focus();
        }
    }

    function checkSession() {
        const session = localStorage.getItem(CONFIG.sessionKey);
        if (session) {
            try {
                const data = JSON.parse(session);
                if (data.expires > Date.now()) {
                    state.authenticated = true;
                    showAdminScreen();
                    loadPosts();
                    return;
                }
            } catch (e) {}
            localStorage.removeItem(CONFIG.sessionKey);
        }
        showLoginScreen();
    }

    async function handleLogin(e) {
        e.preventDefault();
        const password = elements.passwordInput.value;
        showLoading();
        try {
            const response = await fetch(`${CONFIG.apiUrl}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                localStorage.setItem(CONFIG.sessionKey, JSON.stringify({
                    token: data.token,
                    expires: Date.now() + (24 * 60 * 60 * 1000)
                }));
                state.authenticated = true;
                elements.loginError.classList.remove('show');
                showAdminScreen();
                loadPosts();
            } else {
                elements.loginError.textContent = data.error || 'Incorrect password. Please try again.';
                elements.loginError.classList.add('show');
                elements.passwordInput.value = '';
                elements.passwordInput.focus();
            }
        } catch (err) {
            console.error('Login error:', err);
            elements.loginError.textContent = 'Connection error. Please try again.';
            elements.loginError.classList.add('show');
        }
        hideLoading();
    }

    function handleLogout() {
        localStorage.removeItem(CONFIG.sessionKey);
        state.authenticated = false;
        state.posts = [];
        showLoginScreen();
        notify('Logged out successfully');
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        const currentPassword = elements.currentPasswordInput.value;
        const newPassword = elements.newPasswordInput.value;
        const confirmPassword = elements.confirmPasswordInput.value;

        if (newPassword !== confirmPassword) {
            notify('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            notify('Password must be at least 6 characters', 'error');
            return;
        }

        showLoading();
        try {
            const response = await fetch(`${CONFIG.apiUrl}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                notify('Password changed successfully!');
                elements.currentPasswordInput.value = '';
                elements.newPasswordInput.value = '';
                elements.confirmPasswordInput.value = '';
                showDashboard();
            } else {
                notify(data.error || 'Failed to change password', 'error');
            }
        } catch (err) {
            console.error('Change password error:', err);
            notify('Connection error. Please try again.', 'error');
        }
        hideLoading();
    }

    function getAuthToken() {
        const session = localStorage.getItem(CONFIG.sessionKey);
        if (session) {
            try { return JSON.parse(session).token; } catch (e) {}
        }
        return null;
    }

    function showLoginScreen() {
        elements.loginScreen.style.display = 'flex';
        elements.adminScreen.style.display = 'none';
        elements.passwordInput.value = '';
        elements.passwordInput.focus();
    }

    function showAdminScreen() {
        elements.loginScreen.style.display = 'none';
        elements.adminScreen.style.display = 'block';
        showDashboard();
    }

    function showDashboard() {
        elements.dashboardView.style.display = 'block';
        elements.editorView.style.display = 'none';
        elements.settingsView.style.display = 'none';
    }

    function showEditor() {
        elements.dashboardView.style.display = 'none';
        elements.editorView.style.display = 'block';
        elements.settingsView.style.display = 'none';
    }

    function showSettings() {
        elements.dashboardView.style.display = 'none';
        elements.editorView.style.display = 'none';
        elements.settingsView.style.display = 'block';
    }

    async function loadPosts() {
        showLoading();
        try {
            const response = await fetch(`${CONFIG.apiUrl}/posts`, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (response.ok) {
                const data = await response.json();
                state.posts = data.posts || [];
                renderPosts();
            } else if (response.status === 401) {
                handleLogout();
            }
        } catch (err) {
            console.error('Load posts error:', err);
            notify('Failed to load posts', 'error');
        }
        hideLoading();
    }

    function renderPosts() {
        if (state.posts.length === 0) {
            elements.postsContainer.innerHTML = '<div class="posts-empty"><h3>No posts yet</h3><p>Click "New Post" to write your first article.</p></div>';
            return;
        }
        const sorted = [...state.posts].sort((a, b) => new Date(b.date) - new Date(a.date));
        elements.postsContainer.innerHTML = sorted.map(post => `
            <div class="post-item" data-id="${post.id}">
                <div class="post-info">
                    <div class="post-title">${escapeHtml(post.title)}<span class="post-status ${post.published ? 'published' : 'draft'}">${post.published ? 'Published' : 'Draft'}</span></div>
                    <div class="post-meta">${formatDate(post.date)}</div>
                </div>
                <div class="post-actions">
                    <button class="post-action-btn" onclick="window.adminEditPost('${post.id}')">Edit</button>
                    ${post.published ? `<button class="post-action-btn" onclick="window.adminViewPost('${post.slug}')">View</button>` : ''}
                    <button class="post-action-btn delete" onclick="window.adminDeletePost('${post.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    window.adminEditPost = function(id) {
        const post = state.posts.find(p => p.id === id);
        if (post) openEditor(post);
    };

    window.adminViewPost = function(slug) {
        window.open(`/blog/${slug}.html`, '_blank');
    };

    window.adminDeletePost = async function(id) {
        if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
        showLoading();
        try {
            const response = await fetch(`${CONFIG.apiUrl}/posts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            if (response.ok) {
                state.posts = state.posts.filter(p => p.id !== id);
                renderPosts();
                notify('Post deleted');
            } else {
                notify('Failed to delete post', 'error');
            }
        } catch (err) {
            console.error('Delete error:', err);
            notify('Failed to delete post', 'error');
        }
        hideLoading();
    };

    function openEditor(post = null) {
        state.editingId = post ? post.id : null;
        state.featuredImage = post ? post.image : null;
        elements.postTitle.value = post ? post.title : '';
        elements.postContent.value = post ? post.content : '';
        if (state.featuredImage) {
            elements.imageUpload.innerHTML = `<img src="${state.featuredImage}" class="image-preview" alt="Featured image">`;
            elements.imageUpload.classList.add('has-image');
        } else {
            resetImageUpload();
        }
        showEditor();
        elements.postTitle.focus();
    }

    function closeEditor() {
        if (elements.postTitle.value || elements.postContent.value) {
            if (!confirm('You have unsaved changes. Are you sure you want to leave?')) return;
        }
        state.editingId = null;
        state.featuredImage = null;
        elements.postTitle.value = '';
        elements.postContent.value = '';
        resetImageUpload();
        showDashboard();
    }

    function resetImageUpload() {
        elements.imageUpload.innerHTML = '<svg class="image-upload-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg><div class="image-upload-text">Click to upload an image</div><div class="image-upload-hint">JPG, PNG, or WebP - Max 5MB</div>';
        elements.imageUpload.classList.remove('has-image');
        elements.imageInput.value = '';
    }

    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            notify('Please upload a JPG, PNG, or WebP image', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            notify('Image must be under 5MB', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.imageUpload.innerHTML = `<img src="${e.target.result}" class="image-preview" alt="Featured image">`;
            elements.imageUpload.classList.add('has-image');
            state.featuredImage = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async function savePost(publish = false) {
        const title = elements.postTitle.value.trim();
        const content = elements.postContent.value.trim();
        if (!title) { notify('Please enter a title', 'error'); elements.postTitle.focus(); return; }
        if (!content) { notify('Please enter some content', 'error'); elements.postContent.focus(); return; }
        showLoading();
        const postData = { title, content, image: state.featuredImage, published: publish, author: CONFIG.author };
        if (state.editingId) postData.id = state.editingId;
        try {
            const response = await fetch(`${CONFIG.apiUrl}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                body: JSON.stringify(postData)
            });
            const data = await response.json();
            if (response.ok) {
                if (state.editingId) {
                    const idx = state.posts.findIndex(p => p.id === state.editingId);
                    if (idx >= 0) state.posts[idx] = data.post;
                } else {
                    state.posts.push(data.post);
                }
                state.editingId = null;
                state.featuredImage = null;
                elements.postTitle.value = '';
                elements.postContent.value = '';
                resetImageUpload();
                renderPosts();
                showDashboard();
                notify(publish ? 'Post published!' : 'Draft saved');
            } else {
                notify(data.error || 'Failed to save post', 'error');
            }
        } catch (err) {
            console.error('Save error:', err);
            notify('Failed to save post', 'error');
        }
        hideLoading();
    }

    function openPreview() {
        const title = elements.postTitle.value.trim();
        const content = elements.postContent.value.trim();
        if (!title && !content) { notify('Nothing to preview', 'error'); return; }
        elements.previewContent.innerHTML = `<h1 style="font-family: var(--font-heading); font-size: 2rem; margin-bottom: 20px;">${escapeHtml(title)}</h1>${markdownToHtml(content)}`;
        elements.previewModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closePreview() {
        elements.previewModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    function markdownToHtml(text) {
        let html = escapeHtml(text);
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');
        html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
        html = html.split('\n\n').map(para => (para.trim() && !para.startsWith('<')) ? `<p>${para}</p>` : para).join('\n');
        html = html.replace(/<p>([^<]+)\n([^<]+)<\/p>/g, '<p>$1<br>$2</p>');
        return html;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function showLoading() { elements.loading.classList.add('show'); }
    function hideLoading() { elements.loading.classList.remove('show'); }

    function notify(message, type = 'success') {
        elements.notificationText.textContent = message;
        elements.notification.className = `notification ${type} show`;
        setTimeout(() => { elements.notification.classList.remove('show'); }, 3000);
    }

    init();
})();
