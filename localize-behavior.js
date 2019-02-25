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
					},
					'en': {
						'delete': 'Delete',
					},
					'es': {
						'delete': 'Eliminar',
					},
					'fr': {
						'delete': 'Supprimer',
					},
					'ja': {
						'delete': '削除',
					},
					'ko': {
						'delete': '삭제',
					},
					'nl': {
						'delete': 'Verwijderen',
					},
					'pt': {
						'delete': 'Excluir',
					},
					'sv': {
						'delete': 'Ta bort',
					},
					'tr': {
						'delete': 'Sil',
					},
					'zh': {
						'delete': '删除',
					},
					'zh-tw': {
						'delete': '刪除',
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
