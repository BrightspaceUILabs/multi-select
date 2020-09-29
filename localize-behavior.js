import 'd2l-localize-behavior/d2l-localize-behavior.js';
window.D2L = window.D2L || {};
window.D2L.PolymerBehaviors = window.D2L.PolymerBehaviors || {};
window.D2L.PolymerBehaviors.D2LMultiSelect = window.D2L.PolymerBehaviors.D2LMultiSelect || {};
/** @polymerBehavior D2L.PolymerBehaviors.D2LMultiSelect.LocalizeBehavior */
D2L.PolymerBehaviors.D2LMultiSelect.LocalizeBehaviorImpl = {
	properties: {
		/**
		 * Localization resources.
		 */
		resources: {
			value: function() {
				return {
					'ar': {
						'delete': 'حذف',
						'hide': 'إخفاء',
						'hiddenChildren': '+ {num} أكثر',
					},
					'en': {
						'delete': 'Delete',
						'hide': 'Hide',
						'hiddenChildren': '+ {num} more',
						'clearList': 'Clear List'
					},
					'es': {
						'delete': 'Eliminar',
						'hide': 'Ocultar',
						'hiddenChildren': '+ {num} más',
					},
					'fr': {
						'delete': 'Supprimer',
						'hide': 'Masquer',
						'hiddenChildren': '+ {num} plus',
					},
					'ja': {
						'delete': '削除',
						'hide': '表示しない',
						'hiddenChildren': '+ {num} 増やす',
					},
					'ko': {
						'delete': '삭제',
						'hide': '숨기기',
						'hiddenChildren': '+ {num} 더 많이',
					},
					'nl': {
						'delete': 'Verwijderen',
						'hide': 'Verbergen',
						'hiddenChildren': '+ {num} meer',
					},
					'pt': {
						'delete': 'Excluir',
						'hide': 'Ocultar',
						'hiddenChildren': '+ {num} mais',
					},
					'sv': {
						'delete': 'Ta bort',
						'hide': 'Dölj',
						'hiddenChildren': '+ {num} mer',
					},
					'tr': {
						'delete': 'Sil',
						'hide': 'Gizle',
						'hiddenChildren': '+ {num} daha',
					},
					'zh': {
						'delete': '删除',
						'hide': '隐藏',
						'hiddenChildren': '+ {num} 更多',
					},
					'zh-tw': {
						'delete': '刪除',
						'hide': '隱藏',
						'hiddenChildren': '+ {num} 其他',
					}
				};
			}
		}
	}
};
/** @polymerBehavior D2L.PolymerBehaviors.D2LMultiSelect.LocalizeBehavior */
D2L.PolymerBehaviors.D2LMultiSelect.LocalizeBehavior = [
	D2L.PolymerBehaviors.LocalizeBehavior,
	D2L.PolymerBehaviors.D2LMultiSelect.LocalizeBehaviorImpl
];
