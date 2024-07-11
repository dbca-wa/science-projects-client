import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Center, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import ColorPicker from "./ColourPicker/ColorPicker";

export const RightClickTableMenu = () => {
  const { colorMode } = useColorMode();
  const menuBgColor = colorMode === "light" ? "bg-white" : "bg-gray-800";
  const menuLabelBgColor =
    colorMode === "light" ? "bg-slate-50" : "bg-gray-700";
  const textColor = colorMode === "light" ? "text-black" : "text-white";
  const seperatorColor = colorMode === "light" ? "bg-border" : "bg-gray-500";

  const [backgroundColor, setBackgroundColor] = useState("#ffa500");

  useEffect(() => {
    console.log(backgroundColor);
  }, [backgroundColor]);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          className={`flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm`}
          style={{ background: backgroundColor }}
        >
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent className={`w-64 ${menuBgColor}`}>
          <ContextMenuLabel
            inset
            className={`select-none ${menuLabelBgColor} ${textColor}`}
          >
            Cell
          </ContextMenuLabel>

          <ContextMenuSub>
            <ContextMenuSubTrigger inset className={`${textColor}`}>
              Background Colour
            </ContextMenuSubTrigger>
            <ContextMenuSubContent
              className={`w-[265px] ${menuBgColor} ${textColor}`}
            >
              <Center>
                <ColorPicker
                  color={backgroundColor}
                  onChange={setBackgroundColor}
                  w={214}
                  h={150}
                />
              </Center>
            </ContextMenuSubContent>
          </ContextMenuSub>
          {/* <ContextMenuSeparator className={`${seperatorColor}`}/> */}
          <ContextMenuSeparator className={`${seperatorColor}`} />

          <ContextMenuLabel
            inset
            className={`select-none ${menuLabelBgColor} ${textColor}`}
          >
            Rows and Columns
          </ContextMenuLabel>

          <ContextMenuSub>
            <ContextMenuSubTrigger inset className={`${textColor}`}>
              Insert
            </ContextMenuSubTrigger>
            <ContextMenuSubContent
              className={`w-48 ${textColor} ${menuBgColor} `}
            >
              <ContextMenuItem className={`${textColor}`}>
                Insert Row Above
              </ContextMenuItem>
              <ContextMenuItem className={`${textColor}`}>
                Insert Row Below
              </ContextMenuItem>
              <ContextMenuSeparator className={`${seperatorColor}`} />

              <ContextMenuItem className={`${textColor}`}>
                Insert Column Left
              </ContextMenuItem>
              <ContextMenuItem className={`${textColor}`}>
                Insert Column Right
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset className={`${textColor}`}>
              Delete
            </ContextMenuSubTrigger>
            <ContextMenuSubContent
              className={`w-48 ${textColor} ${menuBgColor} `}
            >
              <ContextMenuItem className={`${textColor}`}>
                Delete Row
              </ContextMenuItem>
              <ContextMenuSeparator className={`${seperatorColor}`} />

              <ContextMenuItem className={`${textColor}`}>
                Delete Column
              </ContextMenuItem>
              {/* <ContextMenuSeparator className={`${seperatorColor}`}/>

              <ContextMenuItem className={`${textColor}`}>
                Delete Table
              </ContextMenuItem> */}
            </ContextMenuSubContent>
          </ContextMenuSub>
          {/* <ContextMenuSeparator className={`${seperatorColor}`}/> */}
          <ContextMenuSeparator className={`${seperatorColor}`} />

          <ContextMenuLabel
            inset
            className={`select-none ${menuLabelBgColor} ${textColor}`}
          >
            Table
          </ContextMenuLabel>
          {/* <ContextMenuSeparator className={`${seperatorColor}`}/> */}

          <ContextMenuItem inset className={`${textColor}`}>
            Delete Table
          </ContextMenuItem>

          {/* <ContextMenuSeparator className={`${seperatorColor}`}/>
          <ContextMenuCheckboxItem checked>
            Show Bookmarks Bar
            <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
          <ContextMenuSeparator className={`${seperatorColor}`}/>
          <ContextMenuRadioGroup value="pedro">
            <ContextMenuLabel inset>People</ContextMenuLabel>
            <ContextMenuSeparator className={`${seperatorColor}`}/>
            <ContextMenuRadioItem value="pedro">
              Pedro Duarte
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
          </ContextMenuRadioGroup> */}
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
};
