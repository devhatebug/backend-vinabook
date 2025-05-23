import LevelUser from "../models/level-user";
import { v4 as uuidv4 } from "uuid";

export async function caculatorLevelUser(point: number, userId: string) {
    const levelUser = await LevelUser.findOne({
        where: {
            userId: userId,
        },
    });
    if (point >= 30) {
        if (levelUser) {
            await LevelUser.update(
                { level: 0 },
                {
                    where: {
                        userId: userId,
                    },
                }
            );
        } else {
            await LevelUser.create({
                id: uuidv4(),
                userId: userId,
                level: 0,
            });
        }
        return 0; // VIP
    } else if (point >= 20) {
        if (levelUser) {
            await LevelUser.update(
                { level: 1 },
                {
                    where: {
                        userId: userId,
                    },
                }
            );
        } else {
            await LevelUser.create({
                id: uuidv4(),
                userId: userId,
                level: 1,
            });
        }
        return 1; // FAMILIAR
    } else {
        if (levelUser) {
            await LevelUser.update(
                { level: 2 },
                {
                    where: {
                        userId: userId,
                    },
                }
            );
        } else {
            await LevelUser.create({
                id: uuidv4(),
                userId: userId,
                level: 2,
            });
        }
        return 2; // NORMAL
    }
}
