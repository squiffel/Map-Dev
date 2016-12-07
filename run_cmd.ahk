#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

::runcmd::
runthecmd:
Run, cmd
Sleep, 400
Send, npm start{Enter}
Return

::closeit::
CloseAll:
IfWinExist, Electron
	{
	WinClose, Electron
	Sleep, 300
	GoTo, CloseAll
	}
IfWinExist, ahk_exe cmd.exe
	{
	WinClose, ahk_exe cmd.exe
	GoTo, CloseAll
	}
Return

f4::
GoTo, CloseAll
Return

f3::
GoTo, runthecmd
Return

f5::
consoleLog = win.webContents.openDevTools();
removeLog = //Removed console log

FileRead, OutputVar, main.js
IfInString, OutputVar, %consoleLog%
	{
	StringReplace, NewFile, OutputVar, %consoleLog%, %removeLog%, All
	FileDelete, main.js
	FileAppend, %NewFile%, main.js
	}else{
	IfInString, OutputVar, %removeLog%
		{
		StringReplace, NewFile, OutputVar, %removeLog%, %consoleLog%, All
		FileDelete, main.js
		FileAppend, %NewFile%, main.js
		Return
		}
	}
Return

::openexplorer::
Run, explore %A_WorkingDir%
Return
