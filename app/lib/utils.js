import MsgItemBuild from './msg';

export default ($, PDR) => {
	const RoomId = PDR.getRoomId();
	const PlatForm = PDR.__plat;
	let RoomInfo = null;
	const MsgList = $('.room-chat-messages');
	const _ = {

		$: $,

		sendAjax: (url, data, config) => {
	      return PDR.ajax(url, $.extend({}, config || {}, {
	          data: data || {},
	          dataType: "json"
	      }));
	  },

		getRoomInfo: (roomId) => {
			return _.sendAjax("/api_room_v2", {
		    roomid: roomId || RoomId,
		    pub_key: "",
		    __plat: PlatForm,
		    _: $.now()
			}).then(res => {
	        return (res && 0 == res.errno && res.data) ? res.data : null;
			}).fail(() => null);
		},

		getMyInfo: () => {
			return _.sendAjax('/ajax_get_myinfo',{
				option: 'bamboos,ishost,isbanned,exp',
				roomid: RoomId
			}).then(res => {
				return (res && 0 == res.errno && res.data) ? res.data : null;
			}).fail(() => null);
		},

		_buildMsg: (msg) => {
			return {
			  __plat: PDR.__plat,
			  content: msg,
			  hostid: RoomInfo.hostinfo.rid,
			  roomid: RoomInfo.roominfo.id,
			  type: 1
			};
		},

    sendMessage: (msg) => {
			if(!RoomInfo) {
		    return _.getRoomInfo(PDR.getRoomId()).then((info) => {
	        RoomInfo = info;
	        return _.sendAjax('/ajax_send_group_msg', _._buildMsg(msg));
		    });
			} else {
		    return _.sendAjax('/ajax_send_group_msg', _._buildMsg(msg));
			}
		},

		appendMsgToList: (msg) => {
			return _.getMyInfo().then(info => {
				const html = MsgItemBuild({
					u: {
						nickName: info.nickName,
						level: info.exp.level,
						rid: info.rid,
						identity: info.identity,
						sp_identity: info.sp_identity,
						isManager: info.identity == 60,
						isSuper: info.sp_identity == 120
					},
					msg: msg || '666666'
				});
				MsgList.append($(html));
			});
		}

	} // return
	return _;
}
