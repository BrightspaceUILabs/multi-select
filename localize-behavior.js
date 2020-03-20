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
						'hide': 'Hide',
						'hiddenChildren': '+ {num} more',
					},
					'en': {
						'delete': 'Delete',
						'hide': 'Hide',
						'hiddenChildren': '+ {num} more',
					},
					'es': {
						'delete': 'Eliminar',
						'hide': 'Hide',
						'hiddenChildren': '+ {num} more',
					},
					'fr': {
						'delete': 'Supprimer',
						'hide': 'Hide',
						'hiddenChildren': '+ {num} more',
					},
					'ja': {
						'delete': '削除',
						'hide': 'Hide',
						'hiddenChildren': '+ {num} more',
					},
					'ko': {
						'delete': '삭제',
						'hide': 'Hide',
						'hiddenChildren': '+ {num} more',
					},
					'nl': {
						'delete': 'Verwijderen',
						'hide': 'Hide',
						'hiddenChildren': '+ {num} more',
					},
					'pt': {
						'delete': 'Excluir',
						'hide': 'Hide',
						'hiddenChildren': '+ {num} more',
					},
					'sv': {
						'delete': 'Ta bort',
						'hide': 'Hide',
						'hiddenChildren': '+ {num} more',
					},
					'tr': {
						'delete': 'Sil',
						'hide': 'Hide',
						'hiddenChildren': '+ {num} more',
					},
					'zh': {
						'delete': '删除',
						'hide': 'Hide',
						'hiddenChildren': '+ {num} more',
					},
					'zh-tw': {
						'delete': '刪除',
						'hide': 'Hide',
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
