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
						'hiddenChildren': '+ {num} more',
					},
					'en': {
						'delete': 'Delete',
						'hiddenChildren': '+ {num} more',
					},
					'es': {
						'delete': 'Eliminar',
						'hiddenChildren': '+ {num} more',
					},
					'fr': {
						'delete': 'Supprimer',
						'hiddenChildren': '+ {num} more',
					},
					'ja': {
						'delete': '削除',
						'hiddenChildren': '+ {num} more',
					},
					'ko': {
						'delete': '삭제',
						'hiddenChildren': '+ {num} more',
					},
					'nl': {
						'delete': 'Verwijderen',
						'hiddenChildren': '+ {num} more',
					},
					'pt': {
						'delete': 'Excluir',
						'hiddenChildren': '+ {num} more',
					},
					'sv': {
						'delete': 'Ta bort',
						'hiddenChildren': '+ {num} more',
					},
					'tr': {
						'delete': 'Sil',
						'hiddenChildren': '+ {num} more',
					},
					'zh': {
						'delete': '删除',
						'hiddenChildren': '+ {num} more',
					},
					'zh-tw': {
						'delete': '刪除',
						'hiddenChildren': '+ {num} more',
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
