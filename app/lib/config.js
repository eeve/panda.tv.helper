import './config.scss';
import template from './config.html';

import Toast from './toast';
import Icon from '../icon.png';

export default function($, utils) {
	const MsgList = $('.room-chat-messages');
	const Body = $('body');

	// 吐司消息
	function toastMsg(msg) {
		new Toast({ context: Body, message: msg }).show();
	}

	// 发送消息
	function send(msg){
		console.log('发送弹幕：', msg);
		utils.sendMessage(msg)
			.then(res => res.errno === 0)
			.then((success) => {
				if(success) {
					console.log('弹幕发送成功！');
					return utils.appendMsgToList(msg);
				} else {
					console.log('弹幕发送失败！');

				}
			});
	}

	const box = $(template);
	$('body').append(box);

	// 页面挂载点
	const trigger = $(`<a href="javascript:;"
		class="room-chat-tool room-chat-tool-fuck" style="background: url(${Icon}) no-repeat; background-size: contain;" data-tips="弹幕助手设置">弹幕助手设置</a>`);
	trigger.on('click', () => {
		box.show();
	});
	$('.room-chat-tool-right').append(trigger);

	// 确定按钮
	let interval = null;
	$('#ui-panda-config-ok').on('click', () => {
		let fuck_mode = parseInt($('input[name="fuck_mode"]:checked').val());
		console.log(`mode changed: ${fuck_mode}`);
		toastMsg('模式已切换');
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
			MsgList.off('e-newgift').on('e-newgift', (e, user, gift) => {
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
				if(!msg){
					return;
				}
				msg = msg.substr(0, msg.length -1) + tail;
				send(msg);
			}, 6000);
			toastMsg('已经开启自动感谢模式');
		} else if(fuck_mode === 1) { // 刷屏
			const persecond = ($('#send_per_second').val() || 3) * 1000;
			const msg = $('#full_screen_text').val() || '666666';
			interval = setInterval(() => {
				send(msg);
			}, persecond);
			toastMsg('已经开启自动刷屏模式');
		} else { // 取消
			// 恢复显示聊天框横幅
			forbid_li.show();
			console.log('canceled');
			toastMsg('任务已停止');
		}
		box.hide();
	});

	// 取消按钮
	$('#ui-panda-config-cancel').on('click', () => {
		box.hide();
	});

	// MsgList.on('e-newmessage', (e, msg) => {
	// 	console.log(111, msg);
	// });

	MsgList.on('e-newgift', (e, user, gift) => {
		console.print(222, user, gift);
	});


	toastMsg('弹幕助手加载完毕！');

	return $;
}
