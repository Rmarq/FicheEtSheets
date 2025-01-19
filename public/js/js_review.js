function copy_content(q_shorttitle) {
    var result = "";
    if ("email" == q_shorttitle.toLowerCase() || "emails" == q_shorttitle.toLowerCase()) {
        //Create list of emails
        let indx = -1;
        $('#data_table thead').find('th').map(function (i) {
            if ($(this).text() === q_shorttitle + ' ')
                indx = i + 1;
        })
        if (indx != -1) {
            $("#data_table tr").each(function () {
                var mail = $(this).find("td:nth-child(" + indx + ")").text();
                if (mail != "" && mail != " ")
                    result += mail + ',';
            });
            result = result.slice(0, -1);
        }
    } else if (q_shorttitle != "") {
        //Create CSV First,Last,Field
        let indx = -1;
        $('#data_table thead').find('th').map(function (i) {
            if ($(this).text() === q_shorttitle + ' ')
                indx = i + 1;
        })
        if (indx != -1) {
            $("#data_table tr").each(function () {
                if ($(this).find("td:first").text() != "")
                    result += '"' + $(this).find("td:first").text() + '";"' + $(this).find("td:nth-child(2)").text() + '";"' + $(this).find("td:nth-child(" + indx + ")").text().replaceAll(";", "").replaceAll("\n", "\\n") + '"\n';
            });
        }
    } else {
        //Dump whole table
        $("#data_table tr").each(function () {
            $(this).find("td").each(function () { result += '"' + $(this).text().replaceAll(";", "").replaceAll("\n", "\\n") + '";' });
            result = result.slice(0, -1);
            result += '\n';
        });
    }
    navigator.clipboard.writeText(result);
    console.log(result);
    alert("Data copied to clipboard and dumped in dev console");
}