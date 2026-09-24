// Script to generate farmerd.drawio and customerd.drawio
const fs = require('fs');
const path = require('path');

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

class DiagramBuilder {
    constructor(name, width = 3200, height = 2400) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.nextId = 2;
        this.cells = [];
    }

    addEntity(label, x, y, w = 150, h = 55, fillColor = '#dae8fc', strokeColor = '#6c8ebf') {
        const id = `ent_${this.nextId++}`;
        const style = `rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=13;fillColor=${fillColor};strokeColor=${strokeColor};fontColor=#000000;shadow=0;`;
        this.cells.push(`        <mxCell id="${id}" value="&lt;b&gt;${escapeXml(label)}&lt;/b&gt;" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />
        </mxCell>`);
        return { id, x, y, w, h, label };
    }

    addAttribute(label, x, y, isPk = false, w = 115, h = 40) {
        const id = `att_${this.nextId++}`;
        const fillColor = isPk ? '#fff2cc' : '#f5f5f5';
        const strokeColor = isPk ? '#d6b656' : '#666666';
        const fontStyle = isPk ? '4' : '0'; // 4 is underline
        const val = isPk ? `&lt;u&gt;${escapeXml(label)}&lt;/u&gt;` : escapeXml(label);
        const style = `ellipse;whiteSpace=wrap;html=1;fontSize=11;fontStyle=${fontStyle};fillColor=${fillColor};strokeColor=${strokeColor};fontColor=#000000;`;
        this.cells.push(`        <mxCell id="${id}" value="${val}" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />
        </mxCell>`);
        return { id, x, y, w, h, label, isPk };
    }

    addRelationship(label, x, y, w = 140, h = 60, fillColor = '#ffe6cc', strokeColor = '#d79b00') {
        const id = `rel_${this.nextId++}`;
        const style = `rhombus;whiteSpace=wrap;html=1;fontStyle=1;fontSize=12;fillColor=${fillColor};strokeColor=${strokeColor};fontColor=#000000;`;
        this.cells.push(`        <mxCell id="${id}" value="&lt;b&gt;${escapeXml(label)}&lt;/b&gt;" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />
        </mxCell>`);
        return { id, x, y, w, h, label };
    }

    connectAttr(entityId, attrId) {
        const edgeId = `edge_${this.nextId++}`;
        const style = 'endArrow=none;html=1;rounded=0;strokeColor=#777777;strokeWidth=1;';
        this.cells.push(`        <mxCell id="${edgeId}" style="${style}" edge="1" parent="1" source="${entityId}" target="${attrId}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`);
    }

    connectRel(entityId, relId, card = '', sourceLabel = '') {
        const edgeId = `edge_${this.nextId++}`;
        const style = 'endArrow=none;html=1;rounded=0;strokeColor=#1e293b;strokeWidth=1.5;fontStyle=1;fontSize=12;';
        const val = card ? escapeXml(card) : '';
        this.cells.push(`        <mxCell id="${edgeId}" value="${val}" style="${style}" edge="1" parent="1" source="${entityId}" target="${relId}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`);
    }

    addTitle(title, subtitle, x = 40, y = 30) {
        const id = `title_${this.nextId++}`;
        const style = 'text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;';
        const val = `&lt;h1 style=&quot;margin:0;font-size:22px;color:#1e293b;&quot;&gt;${escapeXml(title)}&lt;/h1&gt;&lt;p style=&quot;margin:4px 0 0 0;font-size:13px;color:#64748b;&quot;&gt;${escapeXml(subtitle)}&lt;/p&gt;`;
        this.cells.push(`        <mxCell id="${id}" value="${val}" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="700" height="60" as="geometry" />
        </mxCell>`);
    }

    addLegend(x, y) {
        const boxId = `legend_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${boxId}" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8fafc;strokeColor=#cbd5e1;arcSize=8;" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="420" height="150" as="geometry" />
        </mxCell>`);

        const titleId = `legtitle_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${titleId}" value="&lt;b&gt;ER Diagram Symbols (Format Legend)&lt;/b&gt;" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;fontSize=12;fontColor=#334155;" vertex="1" parent="1">
          <mxGeometry x="${x + 15}" y="${y + 10}" width="380" height="20" as="geometry" />
        </mxCell>`);

        // Entity symbol
        const entSymId = `leg_ent_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${entSymId}" value="Entity" style="rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=10;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="${x + 15}" y="${y + 40}" width="80" height="28" as="geometry" />
        </mxCell>`);

        // Relationship symbol
        const relSymId = `leg_rel_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${relSymId}" value="Relationship" style="rhombus;whiteSpace=wrap;html=1;fontStyle=1;fontSize=10;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1">
          <mxGeometry x="${x + 115}" y="${y + 35}" width="95" height="38" as="geometry" />
        </mxCell>`);

        // Attribute symbol
        const attSymId = `leg_att_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${attSymId}" value="Attribute" style="ellipse;whiteSpace=wrap;html=1;fontSize=10;fillColor=#f5f5f5;strokeColor=#666666;" vertex="1" parent="1">
          <mxGeometry x="${x + 230}" y="${y + 40}" width="75" height="28" as="geometry" />
        </mxCell>`);

        // PK Attribute symbol
        const pkSymId = `leg_pk_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${pkSymId}" value="&lt;u&gt;Primary Key&lt;/u&gt;" style="ellipse;whiteSpace=wrap;html=1;fontSize=10;fontStyle=4;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="${x + 320}" y="${y + 40}" width="85" height="28" as="geometry" />
        </mxCell>`);

        // Connecting Line note
        const lineNoteId = `leg_line_${this.nextId++}`;
        this.cells.push(`        <mxCell id="${lineNoteId}" value="&lt;b&gt;Connecting Line:&lt;/b&gt; Connects Entity to Attribute or Relationship. &lt;b&gt;Cardinality:&lt;/b&gt; 1:1, 1:N, M:N" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;fontSize=10;fontColor=#475569;" vertex="1" parent="1">
          <mxGeometry x="${x + 15}" y="${y + 90}" width="390" height="45" as="geometry" />
        </mxCell>`);
    }

    // Helper to arrange attributes neatly around an entity
    attachAttributesAroundEntity(entity, attrList, layoutType = 'circle') {
        const count = attrList.length;
        const centerX = entity.x + entity.w / 2;
        const centerY = entity.y + entity.h / 2;

        if (layoutType === 'circle') {
            const rx = 160 + (count > 6 ? 25 : 0);
            const ry = 120 + (count > 6 ? 20 : 0);
            const startAngle = -Math.PI / 2;
            const angleStep = (2 * Math.PI) / count;

            attrList.forEach((att, idx) => {
                const angle = startAngle + idx * angleStep;
                const ax = Math.round(centerX + rx * Math.cos(angle) - 55);
                const ay = Math.round(centerY + ry * Math.sin(angle) - 20);
                const a = this.addAttribute(att.name, ax, ay, att.isPk);
                this.connectAttr(entity.id, a.id);
            });
        } else if (layoutType === 'top-bottom') {
            // Half on top, half on bottom
            const half = Math.ceil(count / 2);
            const topAttrs = attrList.slice(0, half);
            const botAttrs = attrList.slice(half);

            const topSpacing = 125;
            const topStartX = centerX - ((topAttrs.length - 1) * topSpacing) / 2 - 55;
            topAttrs.forEach((att, idx) => {
                const ax = Math.round(topStartX + idx * topSpacing);
                const ay = entity.y - 70;
                const a = this.addAttribute(att.name, ax, ay, att.isPk);
                this.connectAttr(entity.id, a.id);
            });

            const botSpacing = 125;
            const botStartX = centerX - ((botAttrs.length - 1) * botSpacing) / 2 - 55;
            botAttrs.forEach((att, idx) => {
                const ax = Math.round(botStartX + idx * botSpacing);
                const ay = entity.y + entity.h + 35;
                const a = this.addAttribute(att.name, ax, ay, att.isPk);
                this.connectAttr(entity.id, a.id);
            });
        } else if (layoutType === 'left-right') {
            // Half on left, half on right
            const half = Math.ceil(count / 2);
            const leftAttrs = attrList.slice(0, half);
            const rightAttrs = attrList.slice(half);

            const leftSpacing = 50;
            const leftStartY = centerY - ((leftAttrs.length - 1) * leftSpacing) / 2 - 20;
            leftAttrs.forEach((att, idx) => {
                const ax = entity.x - 135;
                const ay = Math.round(leftStartY + idx * leftSpacing);
                const a = this.addAttribute(att.name, ax, ay, att.isPk);
                this.connectAttr(entity.id, a.id);
            });

            const rightSpacing = 50;
            const rightStartY = centerY - ((rightAttrs.length - 1) * rightSpacing) / 2 - 20;
            rightAttrs.forEach((att, idx) => {
                const ax = entity.x + entity.w + 20;
                const ay = Math.round(rightStartY + idx * rightSpacing);
                const a = this.addAttribute(att.name, ax, ay, att.isPk);
                this.connectAttr(entity.id, a.id);
            });
        } else if (layoutType === 'custom-positions') {
            attrList.forEach(att => {
                const a = this.addAttribute(att.name, att.x, att.y, att.isPk);
                this.connectAttr(entity.id, a.id);
            });
        }
    }

    toString() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Antigravity" version="21.6.8" type="device">
  <diagram id="${this.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}" name="${escapeXml(this.name)}">
    <mxGraphModel dx="2000" dy="1400" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${this.width}" pageHeight="${this.height}" background="#ffffff" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${this.cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
    }
}

module.exports = { DiagramBuilder };
