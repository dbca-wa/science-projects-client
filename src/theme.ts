import { extendTheme } from "@chakra-ui/react";

const config = {
    initialColorMode: "light",
    useSystemColorMode: false,
};

const breakpoints = {
    sm: '320px',
    md: '515px',
    'over690': '690px',
    "740px": "740px",
    "768px": "768px",
    'mdlg': '780px',
    lg: '960px',
    "1080px": "1080px",
    "1200px": "1200px",
    "1240px": "1240px",
    xl: '1455px',
    '1xl': '1550px',
    '2xl': '2000',
    '3xl': '2400',
    '4xl': '2832',
    // '5xl': '2655',
}

const theme = extendTheme({
    config, breakpoints,
    // components: {
    //     // MultiSelect: MultiSelectTheme,
    //     Modal: {
    //         baseStyle: (props: any) => ({
    //             dialog: {
    //                 maxWidth: ["65%", "85%", "85%"],
    //                 minWidth: ["65%", "85%", "85%"],
    //                 maxHeight: ["65%", "85%", "85%"],
    //                 minHeight: ["65%", "85%", "85%"],
    //                 bg: '#000000'
    //             }
    //         })
    //     }
    // }
})


export default theme;