const BaseModel = require('../../shared/models/base.model');
const db = require('../../shared/database/db');

class LabelsModel extends BaseModel {
    constructor() {
        super('labels', ['name']);

        this.createLabel = db.prepare(`
            INSERT INTO labels (name, color)
            VALUES (@name, @color)
        `);

        this.updateLabel = db.prepare(`
            UPDATE labels 
            SET name = @name,
                color = @color
            WHERE id = @id
        `);

        this.addToDish = db.prepare(`
            INSERT INTO dish_labels (dish_id, label_id)
            VALUES (@dish_id, @label_id)
        `);

        this.removeFromDish = db.prepare(`
            DELETE FROM dish_labels
            WHERE dish_id = @dish_id AND label_id = @label_id
        `);

        this.getDishLabels = db.prepare(`
            SELECT l.*
            FROM labels l
            JOIN dish_labels dl ON l.id = dl.label_id
            WHERE dl.dish_id = ?
        `);
    }

    create(data) {
        const result = this.createLabel.run(data);
        return result.lastInsertRowid;
    }

    update(id, data) {
        const updateData = { ...data, id };
        const result = this.updateLabel.run(updateData);
        if (result.changes === 0) {
            throw new NotFoundError(`Label with id ${id} not found`);
        }
        return result;
    }

    addDishLabel(dishId, labelId) {
        return this.addToDish.run({
            dish_id: dishId,
            label_id: labelId
        });
    }

    removeDishLabel(dishId, labelId) {
        return this.removeFromDish.run({
            dish_id: dishId,
            label_id: labelId
        });
    }

    getForDish(dishId) {
        return this.getDishLabels.all(dishId);
    }
}

module.exports = new LabelsModel();