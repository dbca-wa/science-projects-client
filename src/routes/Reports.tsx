// Route for reviewing all reports.
// NOTE: Currently used as a Lexical text editor page, until implemented.

import { Box, Grid } from "@chakra-ui/react"
import { Head } from "../components/Base/Head"
import { SimpleRichTextEditor } from "../components/RichTextEditor/Editors/SimpleRichTextEditor"

export const Reports = () => {

    return (
        <>
            <Box
                mt={5}
            >
                <Head title={"Reports"} />

                <Grid
                    gridTemplateColumns={"repeat(3, 1fr)"}
                >
                    <Box>

                    </Box>

                </Grid>

                <div style={{ fontSize: 20 }}>
                    {/* <Latex>

            </Latex> */}
                    Not yet implemented.
                </div>
                {/* <SimpleRichTextEditor
                    data={
                        "<p>Test</p><ol><li>Hiii\nMy name is Jaridnbsp;Mark</li><li>Bye</li></ol><hr/><p>Did it work?</p>"
                    }
                /> */}
            </Box>
        </>
    )
}