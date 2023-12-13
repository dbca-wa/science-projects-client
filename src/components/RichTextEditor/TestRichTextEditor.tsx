import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';

export const TestRichTextEditor = () => {
    const theme = {
        // Theme styling goes here
        // ...
    }

    const onError = (error) => {
        console.log(error)
    }

    const initialConfig = {
        namespace: "Test Editor",
        theme,
        onError,
    }
    return (
        <LexicalComposer initialConfig={initialConfig}>
            <PlainTextPlugin
                contentEditable={<ContentEditable />}
                placeholder={<div>Enter some text...</div>}
                ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />

        </LexicalComposer>
    )
}