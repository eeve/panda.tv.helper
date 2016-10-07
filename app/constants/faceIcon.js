let IconMap = new Map();
export default function(icons){
	$.each(icons, (index, icon) => {
	    icon = $(icon).find('a');
	    IconMap.set('icon-panda-emoji icon-panda-emoji-' + icon.data('key'), icon.data('txt'));
	});
	return IconMap;
}
