using TMPro;
using UnityEngine;

public class HexGrid : MonoBehaviour
{
	public int width = 6;
	public int height = 6;

	public HexCell cellPrefab;
	public TextMeshProUGUI cellLabelPrefab;
	Canvas gridCanvas;
	HexCell[] cells;

	void Awake()
	{
		gridCanvas = GetComponentInChildren<Canvas>();
		cells = new HexCell[height * width];

		for (int z = 0, i = 0; z < height; z++)
		{
			for (int x = 0; x < width; x++)
			{
				CreateCell(x, z, i++);
			}
		}
	}

	void CreateCell(int x, int z, int i)
	{
		Vector3 position;
		position.x = x * 10f;
		position.y = 0f;
		position.z = z * 10f;

		HexCell cell = cells[i] = Instantiate<HexCell>(cellPrefab);
		cell.transform.SetParent(transform, false);
		cell.transform.localPosition = position;
		
		TextMeshProUGUI label = Instantiate(cellLabelPrefab, gridCanvas.transform, false);
		label.rectTransform.anchoredPosition =
			new Vector2(position.x, position.z);
		label.text = x + "\n" + z;
	}
}