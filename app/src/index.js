import Promise from 'bluebird';
import $ from 'jquery';

import ConfigBox from '../config';
import Toast from '../config/toast';
import MsgBuilder from '../config/msgbuilder';

export default class App {

	printLog() {
		console.log.apply(this, arguments);
	}

	run() {
		this.map = {};
		this.PDR = unsafeWindow.PDR;
		this.roomId = this.PDR.getRoomId();
		let IconMap, LevelMap, PlatformMap = null;
		return this.domReady()
			.then(() => this.before()) // 前期工作
			.then(() => this.faceIcon()) // 加载表情
			.then(map => this.map.icon = map)
			.then(() => this.levelMap()) // 加载等级信息
			.then(map => this.map.level = map)
			.then(() => this.platformMap()) // 加载平台信息
			.then(map => this.map.platform = map)
			.then(() => this.getMyInfo()) // 获取用户信息
			.then(info => {
				if(!info) {
					this.toastMsg('熊猫TV弹幕助手提示你，请先登录！');
				}
				// 所有请求都要带上token
				$.ajaxSetup({
					data: {
						token: info.token
					}
				});
				this.myInfo = info;
			})
			.then(() => this.listenMessageList()) // 监听并处理消息
			.then(() => { // 监听各类消息事件
				this.els.chatMessageList.on('e-newmessage', (e, info) => {
					this.printLog('收到新弹幕', info);
				})
			})
			.catch(e => this.printLog(e));
	}

	// domReady
	domReady() {
		return new Promise((resolve, reject) => {
			var btn = $('.room-chat-send');
			var interval = setInterval(() => {
				this.printLog('scanning...');
				if (btn && btn.length === 1) {
					clearInterval(interval);
					this.printLog('domReady');
					resolve();
				} else {
					btn = $('.room-chat-send');
				}
			}, 1000);
		});
	}

	// 开始前的清理工作
	before() {
		// 收集所有用到的DOM节点
		this.els = {
			body: $('body'), // body
			noticeDiv: $('.room-notice'), // 公告Box
			rankDiv: $('.room-rank-container'), // 榜单Box
			chatDiv: $('.room-chat-container'), // 消息列表大容器Box
			icons: $('.panda-emoji-panel > li'), // 表情Item
			chatMessageList: $('.room-chat-messages'), // 消息列表Box
			giftDiv: $('.room-chat-tips') // 礼物Box
		}

		// 方便调试
		// this.els.noticeDiv.hide();
		// this.els.rankDiv.hide();
		// this.els.chatDiv.css('top',0);
		// $('#side-tools-bar').hide();
		// $('.room-foot-box').hide();
		// $('.room-head-box').hide();
		// $('.room-player-box').hide();
		// $('.room-detail-box').hide();
		// $('.room-gift-container').hide();
		// $('.room-chat-box').css({
		// 	left: 0,
		// 	right: 'auto'
		// });

		// 插入configbox挂载点
		let config = new ConfigBox(this.els.body, this.els.chatMessageList);
		let autoTaskInterval = null;
		config.box.on('changeMode', (e, mode) => {
			this.toastMsg(mode === 2 ? `任务已取消` : `已开启${mode === 0 ? '自动感谢' : '自动刷屏'}模式`);
			this.printLog('change mode', mode);
		}).on('changeTaskMode', (e, autoTask) => {
			autoTaskInterval && clearInterval(autoTaskInterval)
			if(autoTask && $('.room-task-modal li > p').text().replace(/已领取/g, '') != '') { // 设置为自动领并还没领完
				// 循环查看是否可领，并弹出领取框
				autoTaskInterval = setInterval(() => {
					if($('.room-task-modal li > p').text().indexOf('可领取') != -1 && $('.main-geetest-container').length === 0) {
						$('.room-task-modal li').trigger('click'); // 弹出验证码
					}
				}, 1000);
			}
		}).on('sendMessage', (e, msg) => {
			this.printLog('发送弹幕：', msg);
			this.sendMessage(msg)
				.then(res => res.errno === 0)
				.then((success) => {
					if(success) {
						this.printLog('弹幕发送成功！');
						return this.appendMsgToList(msg);
					} else {
						this.printLog('弹幕发送失败，请先登录！');
					}
				});
		});

		return Promise.resolve();
	}


	// 加载表情Map
	faceIcon() {
		var icons = this.els.icons;
		var map = new Map();
		for (var i = icons.length - 1; i >= 0; i--) {
			var icon = $(icons[i]);
	    var link = icon.find('a');
	    map.set('icon-panda-emoji icon-panda-emoji-' + link.data('key'), link.data('txt'));
		}
		return Promise.resolve(map);
	}

	// 等级信息Map
	levelMap() {
		let src = [

			'青铜5',
			'青铜4',
			'青铜3',
			'青铜2',
			'青铜1',

			'白银5',
			'白银4',
			'白银3',
			'白银2',
			'白银1',

			'黄金5',
			'黄金4',
			'黄金3',
			'黄金2',
			'黄金1',

			'铂金5',
			'铂金4',
			'铂金3',
			'铂金2',
			'铂金1',

			'钻石5',
			'钻石4',
			'钻石3',
			'钻石2',
			'钻石1',

			'宗师5',
			'宗师4',
			'宗师3',
			'宗师2',
			'宗师1',

			'王者5',
			'王者4',
			'王者3',
			'王者2',
			'王者1',

			'至尊5',
			'至尊4',
			'至尊3',
			'至尊2',
			'至尊1'
		];
		const map = new Map();
		for (var i = src.length - 1; i >= 0; i--) {
			let level = src[i];
			map.set(`room-chat-tag-user-level icon-level-${i+1}`, `${level}`);
		}
		return Promise.resolve(map);
	}

	// 平台信息
	platformMap() {
		const map = new Map();
		const src = ['ipad', 'android', 'ios', 'android_hd', 'android_tv'];
		for (var i = src.length - 1; i >= 0; i--) {
			let item = src[i];
			map.set(`room-chat-tag-plat room-chat-tag-plat-mobile room-chat-tag-plat-${item}`, `${item.toUpperCase()}`);
		}
		return Promise.resolve(map);
	}

	// 从消息item dom上解析出此用户的基本信息
	parseUserInfoFromMessageItemDom(dom){
		// 基本信息
		let userInfo = {
			nick: dom.data('name'),
    	identity: dom.data('identity'),
    	sp_identity: dom.attr('data-sp-identity'),
    	rid: dom.data('rid'),
    	isMe: dom.hasClass('room-identity-self'),
    	platform: 'WEB',
    	level: '',
    	isManager: dom.hasClass('room-chat-identity-room-manager'),// 是否房管
    	isSuper: dom.hasClass('room-chat-identity-super-manager'),// 是否超管
    	isXiaoZhang: dom.hasClass('room-chat-icon-xiaozhang'),// 是否校长
    	isBaby: dom.hasClass('room-chat-identity-angelababy'),// 是否angelababy
    	isHost: dom.hasClass('room-chat-identity-host')// 是否主播
		};
		// 等级，平台信息
		const tags = dom.find('.room-chat-tags');
    if(tags && tags.length === 1){
			const _level = tags.find('.room-chat-tag-user-level');
			const _plat = tags.find('.room-chat-tag-plat');
			if (_level && _level.length === 1) {
				userInfo.level = this.map.level.get(_level[0].className);
			}
			if (_plat && _plat.length === 1) {
				userInfo.platform = this.map.platform.get(_plat[0].className);
			}
    }
		return userInfo;
	}

	// 从消息item dom上解析消息类型
	parseMessageType(dom) {
		let type = 'message';
		if(dom.hasClass('room-chat-send-bamboo')){
			type = 'bamboo';
		} else if(dom.hasClass('room-chat-send-gift')){
			type = 'gift';
		}
		return type;
	}

	// 从消息item dom上解析文字消息内容
	parseMessageContent(dom) {
		// 消息主体，可能有表情
    const el = dom.find('.room-chat-content');
    const icons = el.find('.icon-panda-emoji');
    let msg = el.text();
    // 把表情解析成表情字符，例如：[:大笑]
    if(icons && icons.length > 0){
        let _temp = [];
        $.each(icons, (index, icon) => {
          _temp.push(`[:${this.map.icon.get(icon.className)}]`);
        });
        msg += _temp.join(' ');
    }
    return msg;
	}

	// 监听消息列表
	listenMessageList(){
		const box = this.els.chatMessageList;
		const giftBox = this.els.giftDiv;
		// 收到新弹幕
		box.on('DOMNodeInserted', () => {

			// 这条消息li dom
	    const dom = box.find('li.room-chat-item').last();

	    // 获取用户基本信息
	    const userInfo = this.parseUserInfoFromMessageItemDom(dom);

	    // 消息类型
	    const type = this.parseMessageType(dom);

	    // 消息
	    if(type === 'message') {
	    	const msg = this.parseMessageContent(dom);
		    // 触发弹幕事件
		    box.trigger("e-newmessage", userInfo, msg);
	    } else

	    //竹子
	    if(type === 'bamboo') {
	    	const giftInfo = {
	    		type: '竹子',
					count: dom.find('.room-chat-send-bamboo-num').text()
				}
	    	// 触发礼物事件
	    	box.trigger("e-newgift", [userInfo, giftInfo]);
	    } else

			// 礼物
	    if(type === 'gift') {
	    	const giftInfo = {
	    		type: dom.find('.room-chat-send-gift-name').text(),
	    		icon: dom.find('.room-chat-send-gift-icon').attr('src'),
	    		combo: dom.find('.room-chat-send-gift-combo').text() || 0,
					count: 1
				}
				// 触发礼物事件
				box.trigger("e-newgift", [userInfo, giftInfo]);
	    }
		});
	}

	ajax(url, data, config) {
		return new Promise((resolve, reject) => {
			$.ajax(url, $.extend({}, config || {}, {
				data: data || {},
        dataType: 'json',
        success: (res) => {
        	resolve($.type(res) === 'string' ? JSON.parse(res) : res);
        },
        error: (err) => {
        	reject(err);
        }
			}));
		})
	}

	getCurrentRoomInfo() {
		return this.ajax('/api_room_v2', {
	    roomid: this.roomId,
	    pub_key: '',
	    __plat: this.PDR.__plat,
	    _: $.now()
		}).then(res => {
      return (res && 0 == res.errno && res.data) ? res.data : null;
		});
	}

	getMyInfo() {
		return this.ajax('/ajax_get_myinfo',{
			option: 'bamboos,ishost,isbanned,exp',
			roomid: this.roomId
		}).then(res => {
			return (res && 0 == res.errno && res.data) ? res.data : null;
		});
	}

	_buildMsg(msg) {
		return {
		  __plat: this.PDR.__plat,
		  content: msg,
		  hostid: this.roomInfo.hostinfo.rid,
		  roomid: this.roomInfo.roominfo.id,
		  type: 1
		};
	}

	sendMessage(msg) {
		if(!this.roomInfo) {
	    return this.getCurrentRoomInfo().then(info => {
        this.roomInfo = info;
        return this.ajax('/ajax_send_group_msg', this._buildMsg(msg));
	    });
		} else {
	    return this.ajax('/ajax_send_group_msg', this._buildMsg(msg));
		}
	}

	appendMsgToList(msg) {
		const html = MsgBuilder({
			u: {
				nickName: this.myInfo.nickName,
				level: this.myInfo.exp.level,
				rid: this.myInfo.rid,
				identity: this.myInfo.identity,
				sp_identity: this.myInfo.sp_identity,
				isManager: this.myInfo.identity == 60,
				isSuper: this.myInfo.sp_identity == 120
			},
			msg: msg || '666666'
		});
		this.els.chatMessageList.append($(html));
	}

	// 吐司消息
	toastMsg(msg) {
		new Toast({ context: this.els.body, message: msg, time: 5000 }).show();
	}

}
