class Switcher {
  _SWITCHER_TAB_INPUT_SELECTOR = '.js-switcher-tab-input';
  _SWITCHER_BODY_NODE_SELECTOR = '.js-switcher-body';

  _switcherNode;
  _switcherTabsInputs
  _switcherBodiesNodes;
  _currentBody;

  constructor(config) {
    this._switcherNode = config.switcherNode;
    this._switcherBodiesNodes = this._switcherNode.querySelectorAll(this._SWITCHER_BODY_NODE_SELECTOR);
    this._switcherTabsInputs  = this._switcherNode.querySelectorAll(this._SWITCHER_TAB_INPUT_SELECTOR);

    this._currentBody = Array.from(this._switcherBodiesNodes).find((switcherBodyNode) => {
      return !switcherBodyNode.classList.contains('display-none');
    });

    this._switcherTabsInputs.forEach((switcherTabNode) => {
      switcherTabNode.addEventListener('change', (evt) => {
        this._currentBody.classList.add('display-none');

        const chosenBody = Array.from(this._switcherBodiesNodes).find((switcherBodyNode) => {
          return switcherBodyNode.dataset.switcherBodyName === evt.target.value;
        });

        chosenBody.classList.remove('display-none');
        this._currentBody = chosenBody;
      });
    });
  }
}

export { Switcher }
