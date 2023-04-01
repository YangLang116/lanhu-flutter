//获取children中class=className的Element
function searchChildByClassName(children, className) {
    for (const child of children) {
        const classList = child.classList
        if (classList.contains(className)) return child
    }
    return null
}

//选中某一Element节点
function setHeightLight(node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range)
}