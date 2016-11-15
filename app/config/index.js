import Promise from 'bluebird';
import $ from 'jquery';

import './config.less';
import template from './config.html';
import icon from './icon.png';

export default class ConfigBox{

	constructor(el, MsgList) {
		this.box = $(template);
		this.MsgList = MsgList;
		el.append(this.box);
		this.mount();
		this.bind();
	}

	mount() {
		// 页面挂载点
		const trigger = $(`<a href="javascript:;"
			class="room-chat-tool room-chat-tool-fuck" style="background: url(${icon}) no-repeat; background-size: contain;" data-tips="弹幕助手设置">弹幕助手设置</a>`);
		trigger.on('click', () => {
			this.box.show();
		});
		$('.room-chat-tool-right').append(trigger);
	}

	bind() {
		// 确定按钮
		let interval = null;
		$('#ui-panda-config-ok').on('click', () => {
			let fuck_mode = parseInt($('input[name="fuck_mode"]:checked').val());

			// 清除上一次的定时任务
			interval && clearInterval(interval);

			const forbid_chat_gift = $('#gift-forbid-option-forbid_chat_gift');
			const forbid_li = forbid_chat_gift.closest("li");

			if(fuck_mode === 0){ // auto thank
				// 屏蔽聊天框横幅(如果没有屏蔽则屏蔽，不然获取不到礼物消息)
				forbid_chat_gift.not(':checked') && forbid_chat_gift.trigger('click');
				// 不让用户手动操作此项
				forbid_li.hide();

				const tail = $('#ui-panda-config-tail').val();
				let queue = new Map();
				this.MsgList.off('e-newgift').on('e-newgift', (e, user, gift) => {
					let key = `${user.nick}|${gift.type}`;
					let old = queue.get(key);
					let count = parseInt(gift.combo || gift.count);
					queue.set(key, old ? parseInt(old) + count : count);
				});
				interval = setInterval(() => {
					let msg = '';
					for(let key of queue.keys()){
						let count = queue.get(key);
						let info = key.split('|');
						msg += `感谢${info[0]}送的${count}个${info[1]}，`;
						queue.delete(key);
					}
					if(msg){
						msg = msg.substr(0, msg.length -1) + tail;
						this.box.trigger('sendMessage', msg);
					}
				}, 6000);
			} else if(fuck_mode === 1) { // 刷屏
				const persecond = ($('#send_per_second').val() || 3) * 1000;
				const msg = $('#full_screen_text').val() || '666666';
				interval = setInterval(() => {
					this.box.trigger('sendMessage', msg);
				}, persecond);
			} else { // 取消
				// 恢复显示聊天框横幅
				forbid_li.show();
				console.log('canceled');
				fuck_mode = 2;
			}
			this.box.trigger('changeMode', fuck_mode);
			this.box.hide();
		});
		// 取消按钮
		$('#ui-panda-config-cancel').on('click', () => {
			this.box.hide();
		});
	}

}
