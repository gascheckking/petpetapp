// ============ PETVERSE SOCIAL SYSTEM ============
// Version 1.0 - Feed, posts, likes, kommentarer

const SocialSystem = (function() {
    let posts = [];
    let likes = {};
    let comments = {};

    // Standard posts
    const DEFAULT_POSTS = [
        { id: 'p1', userId: 'ella', userName: 'Ella', userAvatar: '👩‍🎤', petEmoji: '🐉', content: 'Köpte Fire Wings till min drake! 🔥 Nu kan den flyga!', likes: 47, comments: 12, timeAgo: '15 min', image: null, createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
        { id: 'p2', userId: 'max', userName: 'Max', userAvatar: '🧑‍🚀', petEmoji: '🐺', content: 'Level 10! Min varg är nu en legend! 🎉', likes: 32, comments: 8, timeAgo: '1 tim', image: null, createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
        { id: 'p3', userId: 'clara', userName: 'Clara', userAvatar: '👩‍💻', petEmoji: '🦊', content: 'Hittade en legendary skin idag! ✨ Så fin!', likes: 89, comments: 23, timeAgo: '3 tim', image: null, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() }
    ];

    // Ladda posts
    function loadPosts() {
        const saved = Storage.load('social_posts');
        if (saved && saved.length > 0) {
            posts = saved;
        } else {
            posts = [...DEFAULT_POSTS];
            savePosts();
        }
        
        // Ladda likes
        const savedLikes = Storage.load('social_likes');
        if (savedLikes) likes = savedLikes;
        
        return posts;
    }

    // Spara posts
    function savePosts() {
        Storage.save('social_posts', posts);
        Storage.save('social_likes', likes);
    }

    // Skapa nytt inlägg
    function createPost(content, image = null) {
        if (!content && !image) return { success: false, message: 'Skriv något eller välj en bild' };
        
        const user = Storage.loadUser({});
        const pet = PetSystem.getPet();
        const petType = PetSystem.getPetType();
        
        const newPost = {
            id: 'p' + Date.now(),
            userId: user.id || 'user1',
            userName: user.name || 'Användare',
            userAvatar: '👤',
            petEmoji: petType.emoji,
            content: content || 'Kolla in mitt äventyr! 🔥',
            likes: 0,
            comments: 0,
            image: image,
            createdAt: new Date().toISOString(),
            timeAgo: 'just nu'
        };
        
        posts.unshift(newPost);
        savePosts();
        
        // Kolla achievements
        Achievements.checkAchievements({ ...user, posts: posts });
        
        return { success: true, message: '✅ Inlägg publicerat!', post: newPost };
    }

    // Gilla inlägg
    function likePost(postId) {
        const user = Storage.loadUser({});
        const userId = user.id || 'user1';
        
        if (!likes[postId]) likes[postId] = [];
        
        const alreadyLiked = likes[postId].includes(userId);
        
        if (alreadyLiked) {
            // Ta bort like
            likes[postId] = likes[postId].filter(id => id !== userId);
        } else {
            // Lägg till like
            likes[postId].push(userId);
        }
        
        savePosts();
        
        // Uppdatera post likes count
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.likes = likes[postId].length;
        }
        
        return { success: true, liked: !alreadyLiked, count: likes[postId].length };
    }

    // Kolla om användare gillat inlägg
    function hasLiked(postId) {
        const user = Storage.loadUser({});
        const userId = user.id || 'user1';
        return likes[postId]?.includes(userId) || false;
    }

    // Lägg till kommentar
    function addComment(postId, commentText) {
        if (!commentText.trim()) return { success: false, message: 'Skriv en kommentar' };
        
        const user = Storage.loadUser({});
        
        if (!comments[postId]) comments[postId] = [];
        
        const newComment = {
            id: 'c' + Date.now(),
            userId: user.id || 'user1',
            userName: user.name || 'Användare',
            userAvatar: '👤',
            text: commentText,
            createdAt: new Date().toISOString()
        };
        
        comments[postId].push(newComment);
        
        // Uppdatera post comments count
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comments = comments[postId].length;
        }
        
        Storage.save('social_comments', comments);
        savePosts();
        
        return { success: true, comment: newComment };
    }

    // Hämta kommentarer för ett inlägg
    function getComments(postId) {
        if (!comments[postId]) comments[postId] = [];
        return comments[postId];
    }

    // Ta bort inlägg
    function deletePost(postId) {
        const user = Storage.loadUser({});
        const post = posts.find(p => p.id === postId);
        
        if (!post) return { success: false, message: 'Inlägg finns inte' };
        if (post.userId !== (user.id || 'user1')) {
            return { success: false, message: 'Du kan bara ta bort dina egna inlägg' };
        }
        
        const index = posts.findIndex(p => p.id === postId);
        posts.splice(index, 1);
        
        delete likes[postId];
        delete comments[postId];
        
        savePosts();
        Storage.save('social_comments', comments);
        
        return { success: true, message: 'Inlägg borttaget' };
    }

    // Rendera feed
    function renderFeed(container) {
        const user = Storage.loadUser({});
        
        container.innerHTML = posts.map(post => `
            <div class="post" data-post-id="${post.id}">
                <div class="pet-3d-card">
                    <div class="pet-3d-emoji">${PetSystem.getPetType().emoji}</div>
                    <div class="pet-3d-level">Lv.${PetSystem.getPet().level}</div>
                    <div class="pet-3d-name">${PetSystem.getPetType().name}</div>
                </div>
                
                <div class="action-sidebar">
                    <div class="action-btn" onclick="SocialSystem.handleLike('${post.id}')">
                        <div class="action-icon">${hasLiked(post.id) ? '❤️' : '🤍'}</div>
                        <div class="action-count">${post.likes || 0}</div>
                    </div>
                    <div class="action-btn" onclick="SocialSystem.openComments('${post.id}')">
                        <div class="action-icon">💬</div>
                        <div class="action-count">${post.comments || 0}</div>
                    </div>
                    <div class="action-btn" onclick="SocialSystem.sharePost('${post.id}')">
                        <div class="action-icon">📤</div>
                    </div>
                </div>
                
                <div class="post-content">
                    <div class="post-user">
                        <div class="post-avatar">${post.userAvatar}</div>
                        <div>
                            <div class="post-name">${post.userName} · ${post.petEmoji}</div>
                            <div class="post-time">${post.timeAgo || Utils.formatTimeAgo(post.createdAt)}</div>
                        </div>
                    </div>
                    <div class="post-text">${Utils.escapeHtml(post.content)}</div>
                    ${post.image ? `<img src="${post.image}" class="post-image" onclick="SocialSystem.viewImage('${post.image}')">` : ''}
                </div>
            </div>
        `).join('');
    }

    // Hantera like (uppdaterar UI)
    async function handleLike(postId) {
        const result = likePost(postId);
        if (result.success) {
            // Uppdatera bara den specifika postens like-knapp
            const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
            if (postElement) {
                const likeBtn = postElement.querySelector('.action-btn:first-child');
                const likeIcon = likeBtn.querySelector('.action-icon');
                const likeCount = likeBtn.querySelector('.action-count');
                
                likeIcon.innerHTML = result.liked ? '❤️' : '🤍';
                likeCount.innerHTML = result.count;
                
                // Animation
                likeBtn.style.transform = 'scale(1.2)';
                setTimeout(() => likeBtn.style.transform = '', 200);
            }
        }
    }

    // Öppna kommentarer modal
    function openComments(postId) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        
        const postComments = getComments(postId);
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div class="post-user" style="margin-bottom: 10px;">
                    <div class="post-avatar" style="width: 40px; height: 40px; font-size: 20px;">${post.userAvatar}</div>
                    <div>
                        <div class="post-name">${post.userName}</div>
                        <div class="post-text" style="font-size: 14px;">${Utils.escapeHtml(post.content)}</div>
                    </div>
                </div>
            </div>
            
            <div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
                ${postComments.map(comment => `
                    <div style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">${comment.userAvatar}</span>
                            <div>
                                <div style="font-weight: bold; font-size: 12px;">${comment.userName}</div>
                                <div style="font-size: 13px;">${Utils.escapeHtml(comment.text)}</div>
                                <div style="font-size: 10px; color: #888;">${Utils.formatTimeAgo(comment.createdAt)}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
                ${postComments.length === 0 ? '<div style="text-align: center; color: #888; padding: 20px;">Inga kommentarer än</div>' : ''}
            </div>
            
            <div style="display: flex; gap: 10px;">
                <input type="text" id="commentInput" class="chat-input" placeholder="Skriv en kommentar..." style="flex: 1;">
                <button class="btn-primary" style="padding: 10px 20px;" onclick="SocialSystem.submitComment('${postId}')">Skicka</button>
            </div>
        `;
        
        // Visa modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">← Tillbaka</button>
                <span style="font-weight: bold;">💬 Kommentarer</span>
                <div style="width: 50px;"></div>
            </div>
        `;
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Spara referens för comment submission
        window.currentCommentPostId = postId;
    }

    // Submit comment
    function submitComment(postId) {
        const input = document.getElementById('commentInput');
        if (!input || !input.value.trim()) return;
        
        const result = addComment(postId, input.value);
        if (result.success) {
            input.value = '';
            // Stäng och öppna igen för att refresh
            document.querySelector('.modal')?.remove();
            openComments(postId);
        }
    }

    // Dela inlägg
    async function sharePost(postId) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        
        const shareText = `${post.content}\n\nMin pet är level ${PetSystem.getPet().level}!\nLadda ner PETVERSE!`;
        
        const shared = await Utils.share({
            title: 'PETVERSE',
            text: shareText,
            url: window.location.href
        });
        
        if (!shared) {
            alert(shareText);
        }
    }

    // Visa bild i fullskärm
    function viewImage(imageUrl) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.background = 'rgba(0,0,0,0.98)';
        modal.innerHTML = `
            <div class="modal-header">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">← Tillbaka</button>
                <span>📸 Bild</span>
                <div style="width: 50px;"></div>
            </div>
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <img src="${imageUrl}" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 20px;">
            </div>
        `;
        document.body.appendChild(modal);
    }

    return {
        loadPosts,
        createPost,
        likePost,
        hasLiked,
        addComment,
        getComments,
        deletePost,
        renderFeed,
        handleLike,
        openComments,
        submitComment,
        sharePost,
        viewImage,
        posts
    };
})();

window.SocialSystem = SocialSystem;