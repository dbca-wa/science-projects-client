import { Box, Text, Select, Input, Button, Grid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import OrgChart from "react-d3-tree";
import { SdsChart } from "../../Latex/SdsChart";

export const SDSChartCreator = () => {

    return (
        <SdsChart />

    );
};


// const { handleSubmit, register, reset } = useForm();
// const [scienceData, setScienceData] = useState([]);
// const [directorData, setDirectorData] = useState([]);

// const onSubmitScience = (data) => {
//     // Add a new user to Science Projects data
//     setScienceData((prevData) => [...prevData, data]);
//     // Reset the form
//     reset();
// };

// const onSubmitDirectorate = (data) => {
//     // Add a new user to Directorate data
//     setDirectorData((prevData) => [...prevData, data]);
//     // Reset the form
//     reset();
// };

// useEffect(() => {
//     console.log(directorData)
// }, [directorData])

// useEffect(() => {
//     console.log(scienceData)
// }, [scienceData])



// <Box>
//     <Text fontSize="xl">SDSChartCreator</Text>

//     <Grid
//         gridTemplateColumns={"repeat(2, 1fr)"}

//     >
//         {/* Display the Organizational Chart */}
//         <Box mt="4">
//             <Text fontWeight="bold">Chart Preview</Text>
//             {directorData.length > 0 && (
//                 <OrgChart data={directorData.concat(scienceData)} />
//             )}

//         </Box>
//         <Box>
//             {/* Add Users to Directorate */}
//             <Box mt="4">
//                 <Text fontWeight="bold">Add User to Directorate</Text>
//                 <form
//                     id="directorate-users"
//                     onSubmit={handleSubmit(onSubmitDirectorate)}>
//                     <Input
//                         name="name"
//                         type="text"
//                         placeholder="Name"
//                         {...register("name", { required: true })}
//                     />
//                     <Input
//                         name="title"
//                         type="text"
//                         placeholder="Title"
//                         {...register("title", { required: true })}
//                     />
//                     <Input
//                         name="order"
//                         type="number"
//                         placeholder="Order"
//                         {...register("order", { required: true })}
//                     />
//                     <Button type="submit">Add User</Button>
//                 </form>
//             </Box>

//             {/* Add Users to Science Projects */}
//             <Box mt="4">
//                 <Text fontWeight="bold">Add User to Science Projects</Text>
//                 <form
//                     id="science-users"
//                     onSubmit={handleSubmit(onSubmitScience)}>
//                     <Input
//                         name="order"
//                         type="number"
//                         placeholder="Order"
//                         {
//                         ...register("order", { required: true })
//                         }
//                     />
//                     <Select name="businessArea"
//                         {...register("businessArea", { required: true })}
//                     >
//                         {/* Add selectable options for Business Area */}
//                         <option value="Option 1">Option 1</option>
//                         <option value="Option 2">Option 2</option>
//                     </Select>
//                     <Input
//                         name="user"
//                         type="text"
//                         placeholder="User"
//                         {
//                         ...register("user", { required: true })
//                         }
//                     />
//                     <Button type="submit">Add User</Button>
//                 </form>
//             </Box>


//         </Box>


//     </Grid>
// </Box>