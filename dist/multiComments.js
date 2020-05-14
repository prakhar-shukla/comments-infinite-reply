var MultiComment = (function () {

    const $COMMENT_TEMPLATE = document.querySelector(".new-comment-template");
    const $REPLY_BOX_TEMPLATE = document.querySelector(".reply-comment-box");
    const $COMMENT_LIST = document.querySelector(".comment-list");

    var CommentsList = (function () {

        var _commentsList = [];

        class Comment {
            constructor(id, text) {
                this.id = id;
                this.text = text;
                this.children = [];
                this.$elem = document.createElement('div');
                this.onReply = this.onReply.bind(this);
                this.onEdit = this.onEdit.bind(this);
                this.onDelete = this.onDelete.bind(this);
                this.onCancelReply = this.onCancelReply.bind(this);
                this.onSaveReply = this.onSaveReply.bind(this);
                this.onCancelEdit = this.onCancelEdit.bind(this);
                this.onSaveEdit = this.onSaveEdit.bind(this);
            }
            render($location) {
                this.$elem = document.createElement('div');
                this.$elem.append($COMMENT_TEMPLATE.content.cloneNode(true));
                this.$elem.className = "card-wrapper";
                this.$elem.querySelector('.content').innerText = this.text;
                this.$elem.querySelector('.comment-reply-btn').addEventListener('click', this.onReply);
                this.$elem.querySelector('.comment-edit-btn').addEventListener('click', this.onEdit);
                this.$elem.querySelector('.comment-delete-btn').addEventListener('click', this.onDelete);

                $location.prepend(this.$elem);
            }
            onReply(event) {
                const replyBox = $REPLY_BOX_TEMPLATE.content.cloneNode(true);
                this.$elem.querySelector('.comment-card').append(replyBox);
                this.$elem.querySelector('.comment-edit-box .cancel-comment-btn').addEventListener('click', this.onCancelReply)
                this.$elem.querySelector('.comment-edit-box .save-comment-btn').addEventListener('click', this.onSaveReply)
                event.target.toggleAttribute('hidden');
            }
            onEdit(event) {
                this.$elem.querySelector('.content').toggleAttribute('contenteditable');
                this.$elem.querySelector('.action.set-1').toggleAttribute('hidden');
                this.$elem.querySelector('.action.set-2').toggleAttribute('hidden');
                this.$elem.querySelector('.action.set-2 .cancel-comment-btn').addEventListener('click', this.onCancelEdit)
                this.$elem.querySelector('.action.set-2 .save-comment-btn').addEventListener('click', this.onSaveEdit)
                setTimeout(() => {
                    this.$elem.querySelector('.content').focus();
                }, 0);
            }
            onDelete(event) {
                if (this.parent) {
                    const index = this.parent.children.findIndex(element => element.id === this.id);
                    this.parent.children.slice(index, 1);
                }
                else {
                    const index = _commentsList.findIndex(element => element.id === this.id);
                    _commentsList.slice(index, 1);
                }
                this.$elem.remove();
            }
            onCancelReply(event){
                this.$elem.querySelector('.comment-edit-box .cancel-comment-btn').removeEventListener('click', this.onCancelReply);
                this.$elem.querySelector('.comment-edit-box .save-comment-btn').removeEventListener('click', this.onSaveReply);
                this.$elem.querySelector('.comment-edit-box').remove();
                this.$elem.querySelector('.comment-reply-btn').toggleAttribute('hidden');
            }
            onSaveReply(event){
                const id = "CD" + new Date().getTime();
                const commentBox = this.$elem.querySelector('.comment-edit-box textarea');
                const comment = new Comment(id, commentBox.value);
                comment.render(this.$elem.querySelector('.comment-card .replies'));
                comment.parent = this;
                this.children.push(comment);
                this.onCancelReply();
            }
            onCancelEdit(event){
                this.$elem.querySelector('.content').textContent = this.text;
                this.$elem.querySelector('.content').toggleAttribute('contenteditable');
                this.$elem.querySelector('.action.set-1').toggleAttribute('hidden');
                this.$elem.querySelector('.action.set-2').toggleAttribute('hidden');
                this.$elem.querySelector('.action.set-2 .cancel-comment-btn').removeEventListener('click', this.onCancelEdit)
                this.$elem.querySelector('.action.set-2 .save-comment-btn').removeEventListener('click', this.onSaveEdit)
            }
            onSaveEdit(event){
                this.text = this.$elem.querySelector('.content').textContent;
                this.onCancelEdit();
            }

        }

        function addNewComment(value){
            const id = "CD" + new Date().getTime();
            const comment = new Comment(id, value);
            comment.render($COMMENT_LIST);
            _commentsList.push(comment)
        }

        function renderComments(commentArray, location){
            location = location ? location.querySelector('.comment-card .replies') : $COMMENT_LIST;
            commentArray.forEach(element => {
                var comment = new Comment(element.id, element.text)
                comment.render(location);
                if (element.children.length) {
                    renderComments(element.children, comment.$elem)
                    comment.children.push(element.children);
                }
                else {
                    _commentsList.push(comment);
                }
            });
        }

        function getComments(){
            return _commentsList
        }

        return {
            addNewComment: addNewComment,
            renderComments: renderComments,
            getComments: getComments
        }

    })();

    document.querySelector('.save-new-comment-btn').addEventListener('click', (event) => {
        const commentBox = event.target.closest('.comment-edit-box').querySelector('textarea')
        commentBox.value ? CommentsList.addNewComment(commentBox.value) : alert("Please enter value");
        commentBox.value = '';
    })

    window.onload = function (e) {
        if (sessionStorage.getItem('commentList')) {
            CommentsList.renderComments(JSON.parse(sessionStorage.getItem('commentList')))
        }
    }

})();
