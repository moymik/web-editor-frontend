import api from './api'
import {Elements} from "react-flow-renderer";

import {getAttributeValue} from "./attributesRequests";

export const getEdge = async (modelName: string, id: number) => {
    try {
        const response = await api.get(`element/${modelName}/edge/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const getNode = async (modelName: string, id: number) => {
    try {
        const response = await api.get(`element/${modelName}/node/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

export const getModelElements = async (modelName: string, nodes: Array<{ id: number, name: string }>, edges: Array<{ id: number, name: string }>): Promise<Elements> => {
    let elements: Elements = [];
    for (let i = 0, len = nodes.length; i < len; ++i) {
        await getNode(modelName, nodes[i].id).then(data => {
            if (data !== undefined) {
                elements.push(
                    {
                        id: `${data.id}`,
                        type: 'robotsNode',
                        data: {label: data.name},
                        position: {x: 100 + data.id * 10, y: 150 + data.id * 10},
                    }
                );
                const id: number = +JSON.stringify(data.id);
                (async () => {
                    await getAttributeValue(modelName, id, "xCoordinate").then(attributeData => {
                        if (attributeData === undefined || attributeData.length === 0) {
                            (async () => {
                                await api.post(`attribute/${modelName}/${id}/xCoordinate/0`).then(() => {
                                    (async () => {
                                        await api.put(`attribute/${modelName}/${id}/xCoordinate/${100 + id * 10}`)
                                            .catch(error => console.log(error));
                                    })();
                                }).catch(error => console.log(error));
                            })();
                            (async () => {
                                await api.post(`attribute/${modelName}/${id}/yCoordinate/0`).then(() => {
                                    (async () => {
                                        await api.put(`attribute/${modelName}/${id}/yCoordinate/${150 + id * 10}`)
                                            .catch(error => console.log(error));
                                    })();
                                }).catch(error => console.log(error));
                            })();
                        }
                    }).catch(error => console.log(error));
                })();
            }
        })
    }
    for (let i = 0, len = edges.length; i < len; ++i)
    {
        await getEdge(modelName, edges[i].id).then(data => {
            if (data !== undefined) {
                elements.push(
                    {
                        id: `${data.id}`,
                        source: `${data.from.id}`,
                        target: `${data.to.id}`,
                        label: `${data.name}`
                    }
                );
            }
        })
    }

    return elements;
};