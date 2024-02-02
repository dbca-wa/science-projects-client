import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLayoutEffect } from "react";
interface IProps {
    shouldFocus: boolean;
}
export const CustomFocusPlugin = ({ shouldFocus }: IProps) => {
    const [editor] = useLexicalComposerContext();

    useLayoutEffect(() => {
        if (shouldFocus) {
            editor.focus();
        } else {
            editor.blur();
        }
    }, []);

    return null;
};
