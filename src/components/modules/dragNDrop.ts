import SelectionUtils from '../selection';

import Module from '../__module';
export default class DragNDrop extends Module {

  /**
   * If drag has been started at editor, we save it
   *
   * @type Boolean
   * @private
   */
  private isStartedAtEditor = false;

  /**
   * Bind events
   *
   * @private
   */
  public prepare(): void {
    this.bindEvents();
  }

  /**
   * Add drag events listeners to editor zone
   * @private
   */
  private bindEvents(): void {
    this.Editor.Listeners.on(this.Editor.UI.nodes.holder, 'drop', this.processDrop, true);

    this.Editor.Listeners.on(this.Editor.UI.nodes.holder, 'dragstart', (dragEvent: DragEvent) => {
      console.log('dragstart@@@@');
      // dragEvent.dataTransfer.setData('text/plain', '@@@@@@@@');

      if (SelectionUtils.isAtEditor && !SelectionUtils.isCollapsed) {
        this.isStartedAtEditor = true;
      }

      this.Editor.InlineToolbar.close();
    });

    /* Prevent default browser behavior to allow drop on non-contenteditable elements */
    this.Editor.Listeners.on(this.Editor.UI.nodes.holder, 'dragover', (e) => e.preventDefault(), true);
  }

  /**
   * Handle drop event
   *
   * @param {DragEvent} dropEvent
   */
  private processDrop = async (dropEvent: DragEvent): Promise<void> => {
    console.log('drop@@@@@@@@@@' + this.Editor.BlockManager.currentBlockIndex);

    const {
      BlockManager,
      Caret,
      Paste,
    } = this.Editor;

    dropEvent.preventDefault();

    BlockManager.blocks.forEach((block) => block.dropTarget = false);

    if (SelectionUtils.isAtEditor && !SelectionUtils.isCollapsed && this.isStartedAtEditor) {
      document.execCommand('delete');
    }

    this.isStartedAtEditor = false;

    const currentIndex = this.Editor.BlockManager.currentBlockIndex;
    const targetBlock = BlockManager.getBlockByChildNode(dropEvent.target as Node);
    this.Editor.BlockManager.insertAfter(targetBlock, this.Editor.BlockManager.currentBlock);
    // this.Editor.BlockManager.removeBlock(currentIndex);

    /**
     * Try to set current block by drop target.
     * If drop target (error will be thrown) is not part of the Block, set last Block as current.
     */
    try {
      const targetBlock = BlockManager.setCurrentBlockByChildNode(dropEvent.target as Node);
      console.log('!!!!!!!!!!!!!');
      this.Editor.Caret.setToBlock(targetBlock, Caret.positions.END);
    } catch (e) {
      const targetBlock = BlockManager.setCurrentBlockByChildNode(BlockManager.lastBlock.holder);

      this.Editor.Caret.setToBlock(targetBlock, Caret.positions.END);
    }

    console.log(dropEvent.dataTransfer);

    Paste.processDataTransfer(dropEvent.dataTransfer, true);
  }
}
