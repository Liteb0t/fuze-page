Set objFS = CreateObject("Scripting.FileSystemObject")
strFile = "new-look.html"
Set objFile = objFS.OpenTextFile(strFile)
Set nav-file = fso.OpenTextFile("nav3.html", 1)
nav-content = file.ReadAll
Do Until objFile.AtEndOfStream
    strLine = objFile.ReadLine
    If InStr(strLine,"ex3")> 0 Then
        strLine = Replace(strLine,"<!-- nav placeholder -->",nav-content)
    End If 
    WScript.Echo strLine
Loop  