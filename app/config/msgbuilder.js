export default model => `
<li class="room-chat-item room-chat-message room-chat-message-self" data-rid="${model.u.rid}" data-name="${model.u.nickName}" data-identity="${model.u.identity}" data-sp-identity="${model.u.sp_identity}">
    <div class="room-chat-tags">
    	${model.u.isManager ? `<span class="room-chat-tag-user-identity room-chat-icon-room-manager">房管</span>`:``}
    	${model.u.isSuper ? `<span class="room-chat-tag-user-identity room-chat-icon-super-manager">超管</span>`:``}
    	<span class="room-chat-tag-user-level icon-level-${model.u.level}"></span>
    </div>
  <span class="room-chat-user-name" data-toggle="room-manage-menu" data-need-update-identity="" data-rid="${model.u.rid}" data-name="${model.u.nickName}" data-identity="${model.u.identity}" data-sp-identity="${model.u.sp_identity}">${model.u.nickName}:</span>
  <span class="room-chat-content">${model.msg}</span>
</li>
`.trim();
