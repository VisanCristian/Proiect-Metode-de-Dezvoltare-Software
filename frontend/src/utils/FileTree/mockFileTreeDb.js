export const initialMockFileTreeDb = {
    folders: [
        { id: 1, name: "Documents" },
        { id: 2, name: "Images" },
        { id: 3, name: "Projects" },
    ],
    files: [
        {
            id: 1,
            name: "CV",
            type: "text",
            folderId: 1,
            sourceKey: "CV.txt",
        },
        {
            id: 2,
            name: "Budget",
            type: "text",
            folderId: 1,
            sourceKey: "Budget.txt",
        },
        {
            id: 3,
            name: "Photo1",
            type: "pdf",
            folderId: 2,
            sourceKey: "Photo1.pdf.txt",
        },
        {
            id: 4,
            name: "Architecture Notes",
            type: "text",
            folderId: 3,
            sourceKey: "ArchitectureNotes.txt",
        },
    ],
};
