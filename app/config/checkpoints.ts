export interface CheckpointDefinition {
    id: number;
    title: string;
    description: string;
}

export const CHECKPOINT_DEFINITIONS: CheckpointDefinition[] = [
    {
        id: 1,
        title: "Checkpoint 1",
        description: "Initial Concept & Problem Statement Validation. Submit your initial ideas and get them approved."
    },
    {
        id: 2,
        title: "Checkpoint 2",
        description: "Prototype Development & Core Features. Show us your working prototype and core functionalities."
    },
    {
        id: 3,
        title: "Checkpoint 3",
        description: "Final Polish & Presentation Prep. Finalize your project and prepare for the final pitch."
    }
];
