///// Tools /////
function parseColor(colorStr) {
    const aHex = colorStr.substring(1)
    if (aHex === 'FF000000') return 'Colors.white'
    if (aHex === 'FFFFFFFF') return 'Colors.black'
    return `Color(0x${aHex})`
}

function parseWeight(weightStr) {
    const weight = weightStr.toLocaleLowerCase()
    if (weight.indexOf('medium') !== -1) return 'FontWeight.w500'
    if (weight.indexOf('bold') !== -1) return 'FontWeight.bold'
    return 'FontWeight.normal'
}

function insertCode(code) {
    const rootElement = document.querySelector('.annotation_container_b')
    const flutterCodeElement = rootElement.querySelector('.flutter_code')
    if (flutterCodeElement === null) {
        const containerElement = document.createElement('div')
        containerElement.style.backgroundColor = "#fff"
        containerElement.style.width = "100%"
        containerElement.style.height = '142px'
        containerElement.style.position = "absolute"
        containerElement.style.left = 0;
        containerElement.style.top = '60px'

        const titleElement = document.createElement('div')
        titleElement.textContent = 'Flutter 代码'
        titleElement.style.height = "40px"
        titleElement.style.marginLeft = '24px'
        titleElement.style.color = '#2f2e3f'
        titleElement.style.fontSize = '14px'
        titleElement.style.lineHeight = '40px'
        titleElement.style.fontWeight = '500'
        titleElement.style.marginBottom = '12px'
        containerElement.appendChild(titleElement)

        const codeElement = document.createElement('pre')
        codeElement.classList.add('flutter_code')
        codeElement.textContent = code
        codeElement.setAttribute('data-clipboard-text', code)
        codeElement.style.width = 'calc(100% - 48px)'
        codeElement.style.height = '80px'
        codeElement.style.margin = '0 24px'
        codeElement.style.background = '#f7f9fc'
        codeElement.style.borderRadius = '4px'
        codeElement.style.marginBottom = '10px'
        codeElement.style.padding = '8px'
        codeElement.style.overflowY = 'scroll'

        const copyElemet = rootElement.querySelector('.copy_success')
        const clipboard = new ClipboardJS(codeElement)
        clipboard.on('success', (e) => {
            e.clearSelection();
            setHeightLight(codeElement)
            copyElemet.style.top = '70px'
            copyElemet.style.left = '60px'
            copyElemet.style.display = 'block'
            setTimeout(() => copyElemet.style.display = 'none', 1000)
        });

        containerElement.appendChild(codeElement)

        rootElement.insertBefore(containerElement, rootElement.firstChild)
    } else {
        flutterCodeElement.textContent = code
        flutterCodeElement.setAttribute('data-clipboard-text', code)
    }
}
///// Handler /////

function updateFlutterInfoWithSlice(annotationElement) {
    setTimeout(() => {
        const sizeElement = annotationElement.querySelector('.down_list > ul > .list_li > span')
        if (sizeElement === null) return
        const sizeStr = sizeElement.textContent
        if (sizeStr === null) return
        const numStrList = sizeStr.match(/\d+(.\d+)?/g)
        const code = `Image.asset('', width: ${numStrList[0]}, height: ${numStrList[1]})`
        insertCode(code)
    }, 200);
}

function updateFlutterInfoWithText(annotationElement) {
    const ulElement = annotationElement.children[1]
    const colorStr = ulElement.querySelector('.color_item > .copy_text').textContent
    let sizeStr = '16px'
    let weightStr = 'Regular'
    let contentStr = ''
    const itemTitleList = ulElement.querySelectorAll('.item_title')
    for (const child of itemTitleList) {
        const title = child.textContent
        if (title === '字重') {
            weightStr = child.nextElementSibling.textContent
        }
        if (title === '字号') {
            sizeStr = child.nextElementSibling.querySelector('.two').textContent
        }
        if (title === '内容') {
            contentStr = child.nextElementSibling.textContent
        }
    }
    const color = parseColor(colorStr)
    const size = sizeStr.match(/\d+(.\d+)?/g)[0]
    const weight = parseWeight(weightStr)
    const code = `Text(
        '${contentStr}',
        style: TextStyle(
            color: ${color},
            fontSize: ${size},
            fontWeight: ${weight},
            ),
        )`
    insertCode(code)
}

///// Element Tree /////

function updateFlutterInfo(scrollAreaElement) {
    const annotationList = scrollAreaElement.querySelectorAll('.annotation_item')
    if (annotationList.length < 2) {
        insertCode('-')
        return;
    }
    console.log('updateFlutterInfo ...')
    const annotationElement = annotationList[1]
    const classList = annotationElement.classList
    if (classList.contains('slice_item')) { //处理切图
        updateFlutterInfoWithSlice(annotationElement)
        return
    }
    //处理文本
    const subTitleElement = searchChildByClassName(annotationElement.children, "subtitle")
    if (subTitleElement === null) {
        insertCode('-')
        return
    }
    const subTitle = subTitleElement.textContent
    if (subTitle === '文本') {
        updateFlutterInfoWithText(annotationElement)
    } else {
        insertCode('-')
    }
}

function addObserveOnScrollAreaElement(scrollAreaElement) {
    console.log('find target element success')
    const classList = scrollAreaElement.classList
    if (classList.contains('add-obs')) return
    classList.add('add-obs')
    scrollAreaElement.style.top = '200px'
    scrollAreaElement.style.setProperty('height', 'calc(90vh - 107px - 142px)', 'important');
    updateFlutterInfo(scrollAreaElement)
    const scrollAreaChangedListener = function (records) {
        updateFlutterInfo(scrollAreaElement)
    }
    const scrollAreaObs = new MutationObserver(scrollAreaChangedListener)
    scrollAreaObs.observe(scrollAreaElement, { childList: true, subtree: true })
    return scrollAreaObs
}


let lastTimerId = 0
let lastObserve = null
function searchTarget() {
    clearInterval(lastTimerId)
    lastObserve?.disconnect()
    const timerId = setInterval(() => {
        console.log('find target element ...')
        const drawerElement = document.querySelector('#detail_container > .info')
        if (drawerElement === null) return
        const scrollbarElement = drawerElement.querySelector('.lanhu_scrollbar')
        if (scrollbarElement === null) return
        clearInterval(timerId)
        lastObserve = addObserveOnScrollAreaElement(scrollbarElement)
    }, 500)
    lastTimerId = timerId
}

let lastPath = ''
const documentObs = new MutationObserver(function (records) {
    const pageHash = window.location.hash
    if (pageHash.indexOf('/project/detailDetach') === -1) return;
    const index = pageHash.indexOf('?')
    if (index === -1) return
    const path = pageHash.substring(index + 1)
    if (path === lastPath) return
    lastPath = path
    searchTarget()
})

documentObs.observe(document, { childList: true, subtree: true })