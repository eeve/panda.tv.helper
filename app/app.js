import Promise from 'bluebird';

import LevelMap from './constants/level';
import PlatformMap from './constants/platform';
import FaceIcon from './constants/faceIcon';

import Utils from './lib/utils';
import Config from './lib/config';

let IconMap = null;
let RoomInfo = null;

function before($){
	if(__DEV__){
		$('.room-notice').hide();
	  $('.room-rank-container').hide();
	  $('.room-chat-container').css({
	      top: 0
	  });
	}
  return Promise.resolve($);
}

function start($){
	return new Promise((resolve, reject) => {
		let btn = $('.room-chat-send');
		const interval = setInterval(() => {
			console.log('scanning...');
	    if(btn && btn.length === 1){
	    	resolve($);
	    	clearInterval(interval);
	    } else {
	    	btn = $('.room-chat-send');
	    }
		}, 1000);
	});
}

function listenMessageList($){
	const box = $('.room-chat-messages');
	const giftBox = $('.room-chat-tips');
	// 收到新弹幕
	box.bind('DOMNodeInserted', (e) => {
		// 这条消息li
    const self = box.find('li.room-chat-item').last();

    // 获取用户基本信息
    const userInfo = {
    	nick: self.data('name'),
    	identity: self.data('identity'),
    	sp_identity: self.attr('data-sp-identity'),
    	rid: self.data('rid'),
    	isMe: self.hasClass('room-identity-self'),
    	platform: 'WEB',
    	level: '',
    	isManager: self.hasClass('room-chat-identity-room-manager'),// 是否房管
    	isSuper: self.hasClass('room-chat-identity-super-manager'),// 是否超管
    	isXiaoZhang: self.hasClass('room-chat-icon-xiaozhang'),// 是否校长
    	isBaby: self.hasClass('room-chat-identity-angelababy'),// 是否angelababy
    	isHost: self.hasClass('room-chat-identity-host'),// 是否主播
    }
    const tags = self.find('.room-chat-tags');
    if(tags && tags.length === 1){
        const _level = tags.find('.room-chat-tag-user-level');
        const _plat = tags.find('.room-chat-tag-plat');
        if(_level && _level.length === 1){
            userInfo.level = LevelMap.get(_level[0].className);
        }
        if(_plat && _plat.length === 1){
            userInfo.platform = PlatformMap.get(_plat[0].className);
        }
    }

    if(self.hasClass('room-chat-message')){ // 消息

    	// 消息主体，可能有表情
	    const contentel = self.find('.room-chat-content');
	    const haveIcon = contentel.find('.icon-panda-emoji');
	    let msg = contentel.text();
	    if(haveIcon && haveIcon.length > 0){
	        let _temp = [];
	        $.each(haveIcon, (index, icon) => {
	            _temp.push(`[:${IconMap.get(icon.className)}]`);
	        });
	        msg += _temp.join(' ');
	    }

	    // 触发弹幕事件
	    box.trigger("e-newmessage", userInfo);

    } else if(self.hasClass('room-chat-send-bamboo')){ //竹子

    	const giftInfo = {
    		type: '竹子',
				count: self.find('.room-chat-send-bamboo-num').text()
			}
    	// 触发礼物事件
    	box.trigger("e-newgift", [userInfo, giftInfo]);

    } else if(self.hasClass('room-chat-send-gift')){ // 礼物

    	const giftInfo = {
    		type: self.find('.room-chat-send-gift-name').text(),
    		icon: self.find('.room-chat-send-gift-icon').attr('src'),
    		combo: self.find('.room-chat-send-gift-combo').text() || 0,
				count: 1
			}
			// 触发礼物事件
			box.trigger("e-newgift", [userInfo, giftInfo]);

    }
	});

}

export default {
	initialize: ($) => {
		console.log(`jQuery version is : ${$.fn.jquery}`);
		start($)
			// 前置工作
			.then(($) => before($))
			// 初始化表情Map
			.then(($) => {
				const icons = $('.panda-emoji-panel > li');
				IconMap = FaceIcon(icons);
				return $;
			})
			// 监听弹幕消息
			.then(($) => {
				listenMessageList($);
				return $;
			})
			// Utils, Config Box initialize
			.then(($) => Utils($, PDR))
			.then((utils) => Config($, utils))
			.then(e => {
				console.log('done.');
			});
	}
}

