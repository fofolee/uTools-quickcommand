let showPanel = features => {
    let panel = '<table>'
    let n = 0
    features.forEach(p => {
        if (n % 6 == 0) panel += '<tr>'
        panel += `<td>
        <img src="${p.data.features.icon}" cmd="${p.data.features.cmds[0]}">
        <div class="title">${p.data.features.explain}</div>
        </td>`
        n += 1
        if (n % 6 == 0) panel += '</tr>'
    });
    $('#quickpanel').html(panel + '</table>').show()
}


$("#quickpanel").on('click', 'img', function() {
    let cmd = $(this).attr('cmd')
    utools.redirect(cmd)
})

export default {
    showPanel
}
